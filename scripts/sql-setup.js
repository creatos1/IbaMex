
const { Client } = require('pg');
require('dotenv').config();

// Obtener URL de la base de datos de las variables de entorno
const dbUrl = process.env.DATABASE_URL;

const createTablesQueries = `
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  mfaEnabled BOOLEAN DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Routes (
  id SERIAL PRIMARY KEY,
  routeId VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS RouteStops (
  id SERIAL PRIMARY KEY,
  routeId INT REFERENCES Routes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL
);

CREATE TABLE IF NOT EXISTS Buses (
  id SERIAL PRIMARY KEY,
  busId VARCHAR(50) NOT NULL UNIQUE,
  routeId INT REFERENCES Routes(id),
  capacity INT DEFAULT 40,
  currentOccupancy INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  batteryLevel INT DEFAULT 100,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS OccupancyLogs (
  id SERIAL PRIMARY KEY,
  busId INT REFERENCES Buses(id),
  routeId INT REFERENCES Routes(id),
  count INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function setupDatabase() {
  const client = new Client({
    connectionString: dbUrl
  });

  try {
    await client.connect();
    console.log('Conectado a SQL Server...');
    
    console.log('Creando tablas...');
    await client.query(createTablesQueries);
    
    console.log('Tablas creadas correctamente');
  } catch (err) {
    console.error('Error al configurar la base de datos SQL:', err.message);
  } finally {
    await client.end();
  }
}

// Si se ejecuta directamente, configurar la base de datos
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = {
  setupDatabase
};
