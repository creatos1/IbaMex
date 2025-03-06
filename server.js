const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const connectDB = require('./config/db');
const authRoutes = require('./api/auth');
const busRoutes = require('./api/buses');
const routeRoutes = require('./api/routes');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de MongoDB en memoria
const { setupInMemoryMongoDB, stopInMemoryMongoDB } = require('./config/mongodb-setup');

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Si estamos en desarrollo y no hay URI de MongoDB configurada, usar MongoDB en memoria
    if (process.env.NODE_ENV !== 'production' && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost'))) {
      console.log('Configurando MongoDB en memoria para desarrollo...');
      await setupInMemoryMongoDB();
    }

    // Conectar a MongoDB
    await connectDB();
    
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware de seguridad y rendimiento
    app.use(helmet());
    app.use(compression());
    
    // Configuración CORS ampliada para desarrollo
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Configurar rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite de 100 peticiones por ventana
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // Middleware para parsear JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configurar rutas
    app.use('/api', authRoutes);
    app.use('/api/buses', busRoutes);
    app.use('/api/routes', routeRoutes);

    // Simple health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', environment: process.env.NODE_ENV });
    });

    // Servir archivos estáticos en producción
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, 'web-build')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
      });
    }

    // Manejo global de errores
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    });

    // Iniciar el servicio de contador de pasajeros
    const BusCounterService = require('./services/busCounterService');
    const busCounterService = new BusCounterService();

    // Iniciar el servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejo de cierre limpio
    process.on('SIGTERM', async () => {
      console.log('SIGTERM recibido, cerrando servidor...');
      await stopInMemoryMongoDB();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT recibido, cerrando servidor...');
      await stopInMemoryMongoDB();
      process.exit(0);
    });

  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
