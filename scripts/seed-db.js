
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const OccupancyLog = require('../models/OccupancyLog');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ibamex', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Función para sembrar datos
const seedData = async () => {
  try {
    // Conectar a la base de datos
    const conn = await connectDB();
    
    // Limpiar las colecciones existentes
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await OccupancyLog.deleteMany({});
    
    console.log('Colecciones limpiadas');
    
    // Crear usuario administrador
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    const driverPassword = await bcrypt.hash('driver123', salt);
    
    await User.create({
      username: 'admin',
      email: 'admin@ibamex.com',
      password: adminPassword,
      role: 'admin',
      mfaEnabled: false,
      status: 'active'
    });
    
    await User.create({
      username: 'usuario',
      email: 'usuario@ibamex.com',
      password: userPassword,
      role: 'user',
      mfaEnabled: false,
      status: 'active'
    });
    
    await User.create({
      username: 'conductor',
      email: 'conductor@ibamex.com',
      password: driverPassword,
      role: 'driver',
      mfaEnabled: false,
      status: 'active'
    });
    
    console.log('Usuarios creados');
    
    // Crear rutas
    const route1 = await Route.create({
      routeId: 'ROUTE1',
      name: 'Ruta Norte-Sur',
      description: 'Ruta que conecta el norte y sur de la ciudad',
      stops: [
        {
          name: 'Terminal Norte',
          location: { lat: 19.432608, lng: -99.133209 }
        },
        {
          name: 'Centro',
          location: { lat: 19.432208, lng: -99.133100 }
        },
        {
          name: 'Terminal Sur',
          location: { lat: 19.431808, lng: -99.133000 }
        }
      ],
      active: true
    });
    
    const route2 = await Route.create({
      routeId: 'ROUTE2',
      name: 'Ruta Este-Oeste',
      description: 'Ruta que conecta el este y oeste de la ciudad',
      stops: [
        {
          name: 'Terminal Este',
          location: { lat: 19.432508, lng: -99.132209 }
        },
        {
          name: 'Centro Comercial',
          location: { lat: 19.432408, lng: -99.132800 }
        },
        {
          name: 'Terminal Oeste',
          location: { lat: 19.432308, lng: -99.133500 }
        }
      ],
      active: true
    });
    
    console.log('Rutas creadas');
    
    // Crear autobuses
    const bus1 = await Bus.create({
      busId: 'BUS001',
      routeId: 'ROUTE1',
      capacity: 40,
      currentOccupancy: 15,
      status: 'active',
      batteryLevel: 85,
      lastUpdated: new Date()
    });
    
    const bus2 = await Bus.create({
      busId: 'BUS002',
      routeId: 'ROUTE1',
      capacity: 40,
      currentOccupancy: 22,
      status: 'active',
      batteryLevel: 70,
      lastUpdated: new Date()
    });
    
    const bus3 = await Bus.create({
      busId: 'BUS003',
      routeId: 'ROUTE2',
      capacity: 40,
      currentOccupancy: 8,
      status: 'active',
      batteryLevel: 92,
      lastUpdated: new Date()
    });
    
    console.log('Autobuses creados');
    
    // Crear registros de ocupación
    const now = new Date();
    
    // Bus 1 logs
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000); // Una hora atrás por cada iteración
      const count = Math.floor(Math.random() * 40); // 0-40 pasajeros
      
      await OccupancyLog.create({
        busId: 'BUS001',
        routeId: 'ROUTE1',
        count,
        timestamp
      });
    }
    
    // Bus 2 logs
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const count = Math.floor(Math.random() * 40);
      
      await OccupancyLog.create({
        busId: 'BUS002',
        routeId: 'ROUTE1',
        count,
        timestamp
      });
    }
    
    // Bus 3 logs
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const count = Math.floor(Math.random() * 40);
      
      await OccupancyLog.create({
        busId: 'BUS003',
        routeId: 'ROUTE2',
        count,
        timestamp
      });
    }
    
    console.log('Registros de ocupación creados');
    console.log('¡Base de datos inicializada con éxito!');
    
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('Error al sembrar datos:', error);
    process.exit(1);
  }
};

// Ejecutar la función
seedData();
