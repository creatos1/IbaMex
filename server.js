const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Middleware para CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rutas
app.use('/api', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'web-build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
  });
}

// Iniciar el servicio de contador de pasajeros
const BusCounterService = require('./services/busCounterService');
const busCounterService = new BusCounterService();

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});