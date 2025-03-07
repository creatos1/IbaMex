const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Importar módulo de conexión centralizado
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a SQL Server usando el módulo centralizado
    const sql = await connectDB();

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware de seguridad y rendimiento
    app.use(helmet());
    app.use(compression());

    // Configuración CORS ampliada para desarrollo
    app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.2.3.157:3000', 'http://localhost:19006', 'exp://localhost:19000', 'exp://127.0.0.1:19000', 'exp://10.2.3.157:19000', 'http://10.0.2.2:3000', 'http://10.0.2.2:19000', 'http://10.0.2.2:19006', '*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Log para todas las solicitudes (ayuda en depuración)
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
      next();
    });

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

    // Hacer accesible la conexión SQL para los modelos
    app.locals.sql = sql;

    // Configurar rutas
    const authRoutes = require('./api/auth');
    app.use('/api', authRoutes);
    //app.use('/api/buses', busRoutes);
    //app.use('/api/routes', routeRoutes);

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

    // Iniciar el servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API disponible en: http://0.0.0.0:${PORT}/api`);
    });

  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

// Agregar más logs para depuración
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Iniciar el servidor
console.log('Iniciando servidor...');
console.log('Variables de entorno cargadas:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_USER: process.env.DB_USER,
  DB_SERVER: process.env.DB_SERVER,
  DB_NAME: process.env.DB_NAME
});
console.log('Intentando conectar a SQL Server en:', process.env.DB_SERVER || 'DESKTOP-G2I28UV');

startServer();