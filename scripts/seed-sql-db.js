
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Obtener URL de la base de datos de las variables de entorno
const dbUrl = process.env.DATABASE_URL;

async function seedData() {
  const client = new Client({
    connectionString: dbUrl
  });

  try {
    await client.connect();
    console.log('Conectado a SQL Server...');
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Limpiar datos existentes
    console.log('Limpiando datos existentes...');
    await client.query('DELETE FROM OccupancyLogs');
    await client.query('DELETE FROM Buses');
    await client.query('DELETE FROM RouteStops');
    await client.query('DELETE FROM Routes');
    await client.query('DELETE FROM Users');
    
    // Insertar usuarios
    console.log('Creando usuarios...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    const driverPassword = await bcrypt.hash('driver123', salt);
    
    await client.query(`
      INSERT INTO Users (username, email, password, role, mfaEnabled, status)
      VALUES 
        ('admin', 'admin@ibamex.com', $1, 'admin', false, 'active'),
        ('usuario', 'usuario@ibamex.com', $2, 'user', false, 'active'),
        ('chofer', 'chofer@ibamex.com', $3, 'driver', false, 'active')
    `, [adminPassword, userPassword, driverPassword]);
    
    // Insertar rutas
    console.log('Creando rutas...');
    const route1Result = await client.query(`
      INSERT INTO Routes (routeId, name, description, active)
      VALUES ('ROUTE1', 'Ruta Centro - Norte', 'Ruta que conecta el centro con la zona norte', true)
      RETURNING id
    `);
    const route1Id = route1Result.rows[0].id;
    
    const route2Result = await client.query(`
      INSERT INTO Routes (routeId, name, description, active)
      VALUES ('ROUTE2', 'Ruta Este - Oeste', 'Ruta que conecta el este con el oeste', true)
      RETURNING id
    `);
    const route2Id = route2Result.rows[0].id;
    
    // Insertar paradas de ruta
    await client.query(`
      INSERT INTO RouteStops (routeId, name, lat, lng)
      VALUES 
        ($1, 'Centro', 19.432608, -99.133209),
        ($1, 'Reforma', 19.428470, -99.152404),
        ($1, 'Chapultepec', 19.420388, -99.175879),
        ($1, 'Polanco', 19.431837, -99.199568),
        ($2, 'Terminal Este', 19.445233, -99.100294),
        ($2, 'Insurgentes', 19.423738, -99.163419),
        ($2, 'Terminal Oeste', 19.406367, -99.210367)
    `, [route1Id, route2Id]);
    
    // Insertar buses
    console.log('Creando buses...');
    const bus1Result = await client.query(`
      INSERT INTO Buses (busId, routeId, capacity, currentOccupancy, status, batteryLevel)
      VALUES ('BUS001', $1, 45, 12, 'active', 85)
      RETURNING id
    `, [route1Id]);
    const bus1Id = bus1Result.rows[0].id;
    
    const bus2Result = await client.query(`
      INSERT INTO Buses (busId, routeId, capacity, currentOccupancy, status, batteryLevel)
      VALUES ('BUS002', $1, 40, 5, 'active', 92)
      RETURNING id
    `, [route1Id]);
    const bus2Id = bus2Result.rows[0].id;
    
    const bus3Result = await client.query(`
      INSERT INTO Buses (busId, routeId, capacity, currentOccupancy, status, batteryLevel)
      VALUES ('BUS003', $2, 35, 20, 'active', 78)
      RETURNING id
    `, [route2Id]);
    const bus3Id = bus3Result.rows[0].id;
    
    // Insertar logs de ocupación
    console.log('Creando logs de ocupación...');
    
    // Generar registros para las últimas 24 horas
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - i);
      
      // Bus 1
      const bus1Count = Math.floor(Math.random() * 30) + 5;
      await client.query(`
        INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
        VALUES ($1, $2, $3, $4)
      `, [bus1Id, route1Id, bus1Count, timestamp]);
      
      // Bus 2
      const bus2Count = Math.floor(Math.random() * 20) + 2;
      await client.query(`
        INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
        VALUES ($1, $2, $3, $4)
      `, [bus2Id, route1Id, bus2Count, timestamp]);
      
      // Bus 3
      const bus3Count = Math.floor(Math.random() * 25) + 10;
      await client.query(`
        INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
        VALUES ($1, $2, $3, $4)
      `, [bus3Id, route2Id, bus3Count, timestamp]);
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    console.log('Datos iniciales insertados correctamente');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al insertar datos:', err.message);
  } finally {
    await client.end();
  }
}

// Si se ejecuta directamente, sembrar los datos
if (require.main === module) {
  seedData().catch(console.error);
}

module.exports = {
  seedData
};
