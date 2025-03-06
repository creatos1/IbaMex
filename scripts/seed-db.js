
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const OccupancyLog = require('../models/OccupancyLog');

// Cargar variables de entorno
dotenv.config();

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
};

// Conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Conexión a MongoDB establecida');
    return true;
  } catch (err) {
    console.error(`Error de conexión a MongoDB: ${err.message}`);
    return false;
  }
};

// Datos semilla
const seedData = async () => {
  try {
    // Limpiar bases de datos
    console.log('Limpiando bases de datos existentes...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await OccupancyLog.deleteMany({});
    
    // Crear usuario administrador
    console.log('Creando usuarios...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    const driverPassword = await bcrypt.hash('driver123', salt);
    
    await User.create([
      {
        username: 'admin',
        email: 'admin@ibamex.com',
        password: adminPassword,
        role: 'admin',
        mfaEnabled: false,
        status: 'active'
      },
      {
        username: 'usuario',
        email: 'usuario@ibamex.com',
        password: userPassword,
        role: 'user',
        mfaEnabled: false,
        status: 'active'
      },
      {
        username: 'chofer',
        email: 'chofer@ibamex.com',
        password: driverPassword,
        role: 'driver',
        mfaEnabled: false,
        status: 'active'
      }
    ]);
    
    // Crear rutas
    console.log('Creando rutas...');
    const routes = await Route.create([
      {
        routeId: 'ROUTE1',
        name: 'Ruta Centro - Norte',
        description: 'Ruta que conecta el centro con la zona norte',
        stops: [
          { name: 'Centro', location: { lat: 19.432608, lng: -99.133209 } },
          { name: 'Reforma', location: { lat: 19.428047, lng: -99.167130 } },
          { name: 'Polanco', location: { lat: 19.432844, lng: -99.200478 } },
          { name: 'Satélite', location: { lat: 19.508628, lng: -99.234521 } }
        ],
        active: true
      },
      {
        routeId: 'ROUTE2',
        name: 'Ruta Centro - Sur',
        description: 'Ruta que conecta el centro con la zona sur',
        stops: [
          { name: 'Centro', location: { lat: 19.432608, lng: -99.133209 } },
          { name: 'Doctores', location: { lat: 19.415386, lng: -99.143894 } },
          { name: 'Coyoacán', location: { lat: 19.346869, lng: -99.161777 } },
          { name: 'Xochimilco', location: { lat: 19.254908, lng: -99.124865 } }
        ],
        active: true
      },
      {
        routeId: 'ROUTE3',
        name: 'Ruta Oriente - Poniente',
        description: 'Ruta que conecta el este con el oeste',
        stops: [
          { name: 'Pantitlán', location: { lat: 19.415736, lng: -99.072106 } },
          { name: 'Aeropuerto', location: { lat: 19.436357, lng: -99.088734 } },
          { name: 'Zócalo', location: { lat: 19.433136, lng: -99.133208 } },
          { name: 'Chapultepec', location: { lat: 19.421108, lng: -99.188976 } },
          { name: 'Santa Fe', location: { lat: 19.358591, lng: -99.260718 } }
        ],
        active: true
      }
    ]);
    
    // Crear buses
    console.log('Creando buses...');
    const buses = await Bus.create([
      {
        busId: 'BUS001',
        routeId: 'ROUTE1',
        capacity: 40,
        currentOccupancy: 15,
        status: 'active',
        batteryLevel: 85,
        lastUpdated: new Date()
      },
      {
        busId: 'BUS002',
        routeId: 'ROUTE1',
        capacity: 40,
        currentOccupancy: 22,
        status: 'active',
        batteryLevel: 72,
        lastUpdated: new Date()
      },
      {
        busId: 'BUS003',
        routeId: 'ROUTE2',
        capacity: 35,
        currentOccupancy: 18,
        status: 'active',
        batteryLevel: 91,
        lastUpdated: new Date()
      },
      {
        busId: 'BUS004',
        routeId: 'ROUTE3',
        capacity: 45,
        currentOccupancy: 32,
        status: 'active',
        batteryLevel: 65,
        lastUpdated: new Date()
      },
      {
        busId: 'BUS005',
        routeId: 'ROUTE3',
        capacity: 45,
        currentOccupancy: 0,
        status: 'maintenance',
        batteryLevel: 100,
        lastUpdated: new Date()
      }
    ]);
    
    // Crear logs de ocupación (historial)
    console.log('Creando logs de ocupación...');
    
    // Crear datos históricos de los últimos 7 días
    const now = new Date();
    const logs = [];
    
    // Para cada bus, crear datos de los últimos 7 días
    for (const bus of buses) {
      for (let day = 0; day < 7; day++) {
        // Crear datos para diferentes horas del día
        for (let hour = 6; hour < 22; hour++) {
          const timestamp = new Date(now);
          timestamp.setDate(now.getDate() - day);
          timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          
          // Calcular ocupación simulada
          let occupancy;
          if (hour < 8 || (hour > 17 && hour < 20)) {
            // Hora pico - mayor ocupación
            occupancy = Math.floor(Math.random() * (bus.capacity * 0.7) + bus.capacity * 0.3);
          } else {
            // Hora normal - menor ocupación
            occupancy = Math.floor(Math.random() * (bus.capacity * 0.5));
          }
          
          logs.push({
            busId: bus.busId,
            routeId: bus.routeId,
            count: occupancy,
            timestamp: timestamp
          });
        }
      }
    }
    
    await OccupancyLog.insertMany(logs);
    
    console.log('Datos sembrados correctamente');
    console.log(`- ${await User.countDocuments()} usuarios creados`);
    console.log(`- ${await Route.countDocuments()} rutas creadas`);
    console.log(`- ${await Bus.countDocuments()} buses creados`);
    console.log(`- ${await OccupancyLog.countDocuments()} logs de ocupación creados`);
    
    return true;
  } catch (err) {
    console.error('Error al sembrar datos:', err);
    return false;
  }
};

// // Ejecutar sembrado
const run = async () => {
  try {
    await connectDB();
    console.log('Conexión establecida, iniciando sembrado de datos...');
    const success = await seedData();
    
    if (success) {
      console.log('Proceso de sembrado completado satisfactoriamente');
    } else {
      console.error('Error durante el proceso de sembrado');
    }
    
    // Cerrar conexión
    try {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada');
      process.exit(success ? 0 : 1);
    } catch (err) {
      console.error('Error al cerrar la conexión:', err);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error en el proceso de sembrado:', err);
    process.exit(1);
  
}xit(1)
  };

run();
