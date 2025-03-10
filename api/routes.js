
const express = require('express');
const router = express.Router();
const Route = require('../models/routeModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ibamex-secret-key';

// Middleware para validar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
  next();
};

// Obtener todas las rutas activas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const routes = await Route.findAll();
    res.json(routes);
  } catch (err) {
    console.error('Error al obtener rutas:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Obtener una ruta por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const route = await Route.findByRouteId(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    res.json(route);
  } catch (err) {
    console.error('Error al obtener ruta:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Crear una nueva ruta (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { routeId, name, description, stops, waypoints } = req.body;
    
    if (!routeId || !name) {
      return res.status(400).json({ message: 'Se requiere ID de ruta y nombre' });
    }
    
    // Verificar si ya existe una ruta con ese ID
    const routeExists = await Route.findByRouteId(routeId);
    if (routeExists) {
      return res.status(400).json({ message: 'Ya existe una ruta con ese ID' });
    }
    
    const newRoute = await Route.create({
      routeId,
      name,
      description,
      stops: stops || [],
      waypoints: waypoints || [],
      active: true
    });
    
    res.status(201).json(newRoute);
  } catch (err) {
    console.error('Error al crear ruta:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Actualizar una ruta (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, stops, waypoints, active } = req.body;
    
    const route = await Route.findByRouteId(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    const updatedRoute = await Route.update(route.id, {
      name,
      description,
      stops,
      waypoints,
      active
    });
    
    res.json(updatedRoute);
  } catch (err) {
    console.error('Error al actualizar ruta:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Eliminar una ruta (solo admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const route = await Route.findByRouteId(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    await Route.delete(route.id);
    
    res.json({ message: 'Ruta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar ruta:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Agregar parada a una ruta
router.post('/:id/stops', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Se requieren nombre y coordenadas' });
    }
    
    const route = await Route.findByRouteId(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    // Agregar una nueva parada
    const stops = [...route.stops, {
      name,
      location: { lat, lng }
    }];
    
    const updatedRoute = await Route.update(route.id, { stops });
    
    res.status(201).json(updatedRoute);
  } catch (err) {
    console.error('Error al agregar parada:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Actualizar waypoints de una ruta
router.put('/:id/waypoints', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { waypoints } = req.body;
    
    if (!Array.isArray(waypoints)) {
      return res.status(400).json({ message: 'Los waypoints deben ser un array' });
    }
    
    const route = await Route.findByRouteId(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    const updatedRoute = await Route.update(route.id, { waypoints });
    
    res.json(updatedRoute);
  } catch (err) {
    console.error('Error al actualizar waypoints:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;
