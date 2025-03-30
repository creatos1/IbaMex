// routes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const RouteModel = require('../models/RouteModel');

router.post('/', authenticateJWT, async (req, res) => {
  try {
    const routeModel = new RouteModel(req.app.locals.sql);
    const newRoute = await routeModel.create(req.body);
    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: 'Error al crear la ruta' });
  }
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const routeModel = new RouteModel(req.app.locals.sql);
    const routes = await routeModel.findAll();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Error al obtener las rutas' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const routeModel = new RouteModel(req.app.locals.sql);
    const route = await routeModel.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ message: 'Error al obtener la ruta' });
  }
});

router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const routeModel = new RouteModel(req.app.locals.sql);
    const updatedRoute = await routeModel.update(req.params.id, req.body);
    res.json(updatedRoute);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ message: 'Error al actualizar la ruta' });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const routeModel = new RouteModel(req.app.locals.sql);
    const success = await routeModel.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    
    res.json({ message: 'Ruta eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ message: 'Error al eliminar la ruta' });
  }
});

module.exports = router;