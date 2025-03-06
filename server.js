
const express = require('express');
const path = require('path');
const authRoutes = require('./api/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rutas de autenticación
app.use('/api', authRoutes);

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

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
