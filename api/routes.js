
const express = require('express');
const router = express.Router();
const RouteModel = require('../models/routeModel');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Middleware para obtener el modelo de rutas
const getRouteModel = (req, res, next) => {
  if (!req.app.locals.sql) {
    return res.status(500).json({ message: 'Database connection not available' });
  }
  req.routeModel = new RouteModel(req.app.locals.sql);
  next();
};

// Obtener todas las rutas
router.get('/', [authenticateJWT, getRouteModel], async (req, res) => {
  try {
    const { active, search } = req.query;
    
    // Construir filtro
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (search) filter.searchTerm = search;
    
    const routes = await req.routeModel.findAll(filter);
    res.json(routes);
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ message: 'Error al obtener rutas', error: error.message });
  }
});

// Obtener ruta por ID
router.get('/:id', [authenticateJWT, getRouteModel], async (req, res) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const route = await req.routeModel.findById(routeId);
    
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    res.status(500).json({ message: 'Error al obtener ruta', error: error.message });
  }
});

// Crear ruta (solo admin)
router.post('/', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const { routeId, name, description, stops } = req.body;
    
    // Validación básica
    if (!routeId || !name) {
      return res.status(400).json({ message: 'ID de ruta y nombre son requeridos' });
    }
    
    // Validar paradas
    if (stops && Array.isArray(stops)) {
      for (const stop of stops) {
        if (!stop.name || stop.lat === undefined || stop.lng === undefined) {
          return res.status(400).json({ message: 'Cada parada debe tener nombre, latitud y longitud' });
        }
      }
    }
    
    // Crear ruta
    const newRouteId = await req.routeModel.create({
      routeId,
      name,
      description,
      stops,
      active: true
    });
    
    res.status(201).json({ 
      message: 'Ruta creada exitosamente',
      id: newRouteId
    });
  } catch (error) {
    console.error('Error al crear ruta:', error);
    res.status(500).json({ message: 'Error al crear ruta', error: error.message });
  }
});

// Actualizar ruta (solo admin)
router.put('/:id', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const { routeId: newRouteId, name, description, stops, active } = req.body;
    
    // Verificar que la ruta exista
    const existingRoute = await req.routeModel.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    // Validar paradas si se proporcionan
    if (stops && Array.isArray(stops)) {
      for (const stop of stops) {
        if (!stop.name || stop.lat === undefined || stop.lng === undefined) {
          return res.status(400).json({ message: 'Cada parada debe tener nombre, latitud y longitud' });
        }
      }
    }
    
    // Actualizar ruta
    const updated = await req.routeModel.update(routeId, {
      routeId: newRouteId,
      name,
      description,
      stops,
      active
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'No se pudo actualizar la ruta' });
    }
    
    res.json({ message: 'Ruta actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    res.status(500).json({ message: 'Error al actualizar ruta', error: error.message });
  }
});

// Eliminar ruta (solo admin)
router.delete('/:id', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    
    // Verificar que la ruta exista
    const existingRoute = await req.routeModel.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    // Eliminar ruta
    const deleted = await req.routeModel.delete(routeId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'No se pudo eliminar la ruta' });
    }
    
    res.json({ message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    res.status(500).json({ message: 'Error al eliminar ruta', error: error.message });
  }
});

// Añadir parada a ruta (solo admin)
router.post('/:id/stops', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const { name, lat, lng } = req.body;
    
    // Validación básica
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Nombre, latitud y longitud son requeridos' });
    }
    
    // Verificar que la ruta exista
    const existingRoute = await req.routeModel.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    // Añadir parada
    const stopId = await req.routeModel.addStop(routeId, { name, lat, lng });
    
    res.status(201).json({ 
      message: 'Parada añadida exitosamente',
      id: stopId
    });
  } catch (error) {
    console.error('Error al añadir parada:', error);
    res.status(500).json({ message: 'Error al añadir parada', error: error.message });
  }
});

// Actualizar parada (solo admin)
router.put('/stops/:id', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const stopId = parseInt(req.params.id, 10);
    const { name, lat, lng } = req.body;
    
    // Actualizar parada
    const updated = await req.routeModel.updateStop(stopId, { name, lat, lng });
    
    if (!updated) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    
    res.json({ message: 'Parada actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar parada:', error);
    res.status(500).json({ message: 'Error al actualizar parada', error: error.message });
  }
});

// Eliminar parada (solo admin)
router.delete('/stops/:id', [authenticateJWT, isAdmin, getRouteModel], async (req, res) => {
  try {
    const stopId = parseInt(req.params.id, 10);
    
    // Eliminar parada
    const deleted = await req.routeModel.deleteStop(stopId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    
    res.json({ message: 'Parada eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar parada:', error);
    res.status(500).json({ message: 'Error al eliminar parada', error: error.message });
  }
});

module.exports = router;
