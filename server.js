const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const sql = require('mssql'); // Importar el paquete mssql para conectar a SQL Server

// Cargar variables de entorno
dotenv.config();

// Función para conectar a SQL Server
const connectDB = async () => {
  try {
    const pool = await sql.connect({
      user: 'sa',
      password: 'creatos1',
      server: 'DESKTOP-G2I28UV',
      database: 'utasoft',
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      authentication: {
        type: 'default'  // Cambiar esto para usar autenticación de Windows si es necesario
      }
    });

    console.log('Conexión a SQL Server exitosa');
    return pool;
  } catch (error) {
    console.error('Error al conectar a SQL Server:', error.message);
    throw new Error('No se pudo conectar a la base de datos SQL Server');
  }
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a SQL Server
    await connectDB();
    
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware de seguridad y rendimiento
    app.use(helmet());
    app.use(compression());
    
    // Configuración CORS ampliada para desarrollo
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000', 'http://10.0.2.2:3000', 'http://10.0.2.2:19000', 'http://10.0.2.2:19006', '*'],
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

    // Configurar rutas (ajustar si es necesario)
    //app.use('/api', authRoutes);
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

// Iniciar el servidor
startServer();
