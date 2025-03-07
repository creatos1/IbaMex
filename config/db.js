
const { Pool } = require('pg');
require('dotenv').config();

// Crear un pool de conexiones para reutilizarlas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función de conexión con reintentos
const connectDB = async (retryCount = 5) => {
  try {
    console.log('Verificando conexión a SQL Server...');
    
    // Probar la conexión
    const client = await pool.connect();
    console.log('Conexión a SQL Server establecida');
    client.release();
    
    // Configurar eventos para manejar errores
    pool.on('error', (err) => {
      console.error(`Error en la conexión a SQL Server: ${err.message}`);
    });
    
    // Manejar cierre de la aplicación
    process.on('SIGINT', async () => {
      try {
        await pool.end();
        console.log('Conexión a SQL Server cerrada correctamente');
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });
    
    return true;
  } catch (err) {
    console.error(`Error de conexión a SQL Server: ${err.message}`);
    
    if (retryCount > 0) {
      console.log(`Reintentando conexión... (${retryCount} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retryCount - 1);
    } else {
      console.error('Máximo número de reintentos alcanzado. No se pudo conectar a SQL Server.');
      console.log('Intentando continuar sin conexión a base de datos...');
      return false;
    }
  }
};

// Exportar el pool y la función de conexión
module.exports = {
  connectDB,
  pool
};
