
const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
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

// Obtener todas las rutas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener una ruta por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Crear una nueva ruta (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { routeId, name, description, stops } = req.body;
    
    // Verificar si ya existe una ruta con ese ID
    const routeExists = await Route.findOne({ routeId });
    if (routeExists) {
      return res.status(400).json({ message: 'Ya existe una ruta con ese ID' });
    }
    
    const newRoute = new Route({
      routeId,
      name,
      description,
      stops: stops || [],
      active: true
    });
    
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar una ruta (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, stops, active } = req.body;
    
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    // Actualizar campos si se proporcionan
    if (name) route.name = name;
    if (description !== undefined) route.description = description;
    if (stops) route.stops = stops;
    if (active !== undefined) route.active = active;
    
    await route.save();
    
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Agregar parada a una ruta
router.post('/:id/stops', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Se requieren nombre y coordenadas' });
    }
    
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    route.stops.push({
      name,
      location: { lat, lng }
    });
    
    await route.save();
    
    res.status(201).json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Eliminar parada de una ruta
router.delete('/:id/stops/:stopId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    route.stops = route.stops.filter(stop => stop._id.toString() !== req.params.stopId);
    
    await route.save();
    
    res.json({ message: 'Parada eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
