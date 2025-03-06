
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

// Conectar a MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y rendimiento
app.use(helmet());
app.use(compression());
app.use(cors());

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
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});
