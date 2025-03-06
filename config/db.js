
const mongoose = require('mongoose');

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority'
};

// Función de conexión con reintentos
const connectDB = async (retryCount = 5) => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('ERROR: La variable de entorno MONGODB_URI no está definida');
    process.exit(1);
  }

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
      process.exit(1);
    }
  }
};

module.exports = connectDB;
