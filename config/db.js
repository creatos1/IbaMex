
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// Parsear la cadena de conexión de DATABASE_URL o usar valores por defecto
const parseConnectionString = (connectionString) => {
  try {
    // Si es una cadena de conexión completa
    if (connectionString.startsWith('mssql://')) {
      return connectionString;
    }
    
    // Si no, construir configuración manual
    return {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'creatos1',
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'utasoft',
      options: {
        encrypt: process.env.NODE_ENV === 'production', // Usar encriptación en producción
        trustServerCertificate: process.env.NODE_ENV !== 'production'
      }
    };
  } catch (error) {
    console.error('Error al parsear la cadena de conexión:', error.message);
    return {
      user: 'sa',
      password: 'creatos1',
      server: 'localhost',
      database: 'utasoft',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    };
  }
};

const config = parseConnectionString(process.env.DATABASE_URL);

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('Conectado a SQL Server correctamente');
    
    // Verificar esquema de base de datos
    try {
      const setupScript = require('fs').readFileSync('./scripts/create-database.sql', 'utf8');
      await sql.query(setupScript);
      console.log('Esquema de base de datos verificado/creado');
    } catch (err) {
      console.warn('⚠️ Advertencia: No se pudo ejecutar el script de configuración:', err.message);
    }
    
    return sql;
  } catch (error) {
    console.error(`Error al conectar a SQL Server: ${error.message}`);
    throw new Error(`Error al conectar a SQL Server: ${error.message}`);
  }
};

module.exports = connectDB;
