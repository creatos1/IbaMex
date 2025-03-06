
const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const OccupancyLog = require('../models/OccupancyLog');
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

// Middleware para verificar rol de admin o chofer
const isAdminOrDriver = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Require Admin or Driver Role!' });
  }
  next();
};

// Obtener todos los autobuses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener un autobús por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bus = await Bus.findOne({ busId: req.params.id });
    if (!bus) {
      return res.status(404).json({ message: 'Autobús no encontrado' });
    }
    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Crear un nuevo autobús (solo admin)
router.post('/', authenticateToken, isAdminOrDriver, async (req, res) => {
  try {
    const { busId, routeId, capacity } = req.body;
    
    // Verificar si ya existe un autobús con ese ID
    const busExists = await Bus.findOne({ busId });
    if (busExists) {
      return res.status(400).json({ message: 'Ya existe un autobús con ese ID' });
    }
    
    const newBus = new Bus({
      busId,
      routeId,
      capacity: capacity || 40,
      currentOccupancy: 0,
      status: 'active',
      batteryLevel: 100,
      lastUpdated: new Date()
    });
    
    await newBus.save();
    res.status(201).json(newBus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar un autobús (solo admin o conductor)
router.put('/:id', authenticateToken, isAdminOrDriver, async (req, res) => {
  try {
    const { routeId, capacity, status, currentOccupancy, batteryLevel } = req.body;
    
    const bus = await Bus.findOne({ busId: req.params.id });
    if (!bus) {
      return res.status(404).json({ message: 'Autobús no encontrado' });
    }
    
    // Actualizar campos si se proporcionan
    if (routeId) bus.routeId = routeId;
    if (capacity) bus.capacity = capacity;
    if (status) bus.status = status;
    if (currentOccupancy !== undefined) bus.currentOccupancy = currentOccupancy;
    if (batteryLevel !== undefined) bus.batteryLevel = batteryLevel;
    
    bus.lastUpdated = new Date();
    await bus.save();
    
    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener historial de ocupación para un autobús
router.get('/:id/occupancy', authenticateToken, async (req, res) => {
  try {
    const logs = await OccupancyLog.find({ busId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Simular un conteo de pasajeros (para pruebas)
router.post('/:id/simulate', authenticateToken, isAdminOrDriver, async (req, res) => {
  try {
    const { count, routeId } = req.body;
    const busId = req.params.id;
    
    // Crear un registro de ocupación
    const log = new OccupancyLog({
      busId,
      routeId: routeId || 'ROUTE1',
      count,
      timestamp: new Date()
    });
    
    await log.save();
    
    // Actualizar el autobús
    const bus = await Bus.findOne({ busId });
    if (bus) {
      bus.currentOccupancy = count;
      bus.lastUpdated = new Date();
      await bus.save();
    } else {
      // Crear un nuevo autobús si no existe
      const newBus = new Bus({
        busId,
        routeId: routeId || 'ROUTE1',
        currentOccupancy: count,
        lastUpdated: new Date()
      });
      await newBus.save();
    }
    
    res.status(201).json({ message: 'Simulación de conteo registrada correctamente', log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
