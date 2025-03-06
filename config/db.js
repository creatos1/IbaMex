
const mongoose = require('mongoose');

// Opciones de conexión
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  heartbeatFrequencyMS: 10000,
};

// Función de conexión con reintentos
const connectDB = async (retryCount = 5) => {
  // Usar la URI de Replit MongoDB si está disponible, o la variable de entorno
  const uri = process.env.REPLIT_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ibamex';
  
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(uri, options);
    console.log('Conexión a MongoDB establecida');
    
    // Eventos de conexión
    mongoose.connection.on('error', err => {
      console.error(`Error en la conexión a MongoDB: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado. Intentando reconectar...');
      setTimeout(() => connectDB(1), 5000);
    });
    
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada correctamente');
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });
    
  } catch (err) {
    console.error(`Error de conexión a MongoDB: ${err.message}`);
    
    if (retryCount > 0) {
      console.log(`Reintentando conexión... (${retryCount} intentos restantes)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error('Máximo número de reintentos alcanzado. No se pudo conectar a MongoDB.');
      // En lugar de terminar el proceso, intentaremos continuar
      console.log('Intentando continuar sin conexión a base de datos...');
    }
  }
};

module.exports = connectDB;
