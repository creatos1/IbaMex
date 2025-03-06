
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod = null;

// Inicializar MongoDB en memoria para desarrollo
const setupInMemoryMongoDB = async () => {
  try {
    // Crear instancia de MongoDB en memoria
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log('MongoDB en memoria iniciado en:', uri);
    
    // Establecer la URI en las variables de entorno
    process.env.MONGODB_URI = uri;
    
    return uri;
  } catch (err) {
    console.error('Error al iniciar MongoDB en memoria:', err);
    throw err;
  }
};

// Detener MongoDB en memoria
const stopInMemoryMongoDB = async () => {
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    console.log('MongoDB en memoria detenido');
  }
};

module.exports = {
  setupInMemoryMongoDB,
  stopInMemoryMongoDB
};
