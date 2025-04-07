const express = require('express');
const router = express.Router();
const BusModel = require('../models/busModel');
const OccupancyLogModel = require('../models/occupancyLogModel');
const { authenticateJWT, isAdmin, isAdminOrDriver } = require('../middleware/auth');

// Middleware para obtener los modelos
const getModels = (req, res, next) => {
  if (!req.app.locals.sql) {
    return res.status(500).json({ message: 'Database connection not available' });
  }
  req.busModel = new BusModel(req.app.locals.sql);
  req.logModel = new OccupancyLogModel(req.app.locals.sql);
  next();
};

// Obtener todos los buses
router.get('/', [authenticateJWT, getModels], async (req, res) => {
  try {
    const { routeId, driverId, status, active, search } = req.query;

    const filter = {};
    if (routeId) filter.routeId = parseInt(routeId, 10);
    if (driverId) filter.driverId = parseInt(driverId, 10);
    if (status) filter.status = status;
    if (active !== undefined) filter.active = active === 'true';
    if (search) filter.searchTerm = search;

    if (req.user.role === 'driver') {
      filter.driverId = req.user.id;
    }

    const buses = await req.busModel.findAll(filter);
    res.json(buses);
  } catch (error) {
    console.error('Error al obtener buses:', error);
    res.status(500).json({ message: 'Error al obtener buses', error: error.message });
  }
});

// Obtener bus por ID
router.get('/:id', [authenticateJWT, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const bus = await req.busModel.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    if (req.user.role === 'driver' && bus.driverId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este bus' });
    }

    res.json(bus);
  } catch (error) {
    console.error('Error al obtener bus:', error);
    res.status(500).json({ message: 'Error al obtener bus', error: error.message });
  }
});

// Crear bus (solo admin)
router.post('/', [authenticateJWT, isAdmin, getModels], async (req, res) => {
  try {
    const { busId, routeId, driverId, licensePlate, model, capacity, status } = req.body;

    if (!busId || !licensePlate) {
      return res.status(400).json({ message: 'ID de bus y placa son requeridos' });
    }

    const newBusId = await req.busModel.create({
      busId,
      routeId: routeId || null,
      driverId: driverId || null,
      licensePlate,
      model,
      capacity: capacity || 0,
      status: status || 'inactive',
      active: true
    });

    res.status(201).json({ 
      message: 'Bus creado exitosamente',
      id: newBusId
    });
  } catch (error) {
    console.error('Error al crear bus:', error);
    res.status(500).json({ message: 'Error al crear bus', error: error.message });
  }
});

// Asignar conductor a bus
router.post('/assign', [authenticateJWT, isAdmin], async (req, res) => {
  try {
    const { driverId, busId } = req.body;

    if (!driverId || !busId) {
      return res.status(400).json({ message: 'Se requiere driverId y busId' });
    }

    const busModel = new BusModel(req.app.locals.sql);
    const result = await busModel.assignDriver(busId, driverId);

    if (result) {
      res.json({ message: 'Asignación exitosa' });
    } else {
      res.status(400).json({ message: 'Error en la asignación' });
    }
  } catch (error) {
    console.error('Error en la asignación:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar asignación de conductor
router.post('/:id/unassign', [authenticateJWT, isAdmin, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const result = await req.busModel.unassign(busId);

    if (result) {
      res.json({ message: 'Asignación eliminada exitosamente' });
    } else {
      res.status(400).json({ message: 'Error al eliminar la asignación' });
    }
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ message: 'Error al eliminar asignación', error: error.message });
  }
});

// Actualizar bus (solo admin)
router.put('/:id', [authenticateJWT, isAdmin, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const { busId: newBusId, routeId, driverId, licensePlate, model, capacity, status, active } = req.body;

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    const updated = await req.busModel.update(busId, {
      busId: newBusId,
      routeId,
      driverId,
      licensePlate,
      model,
      capacity,
      status,
      active
    });

    if (!updated) {
      return res.status(400).json({ message: 'No se pudo actualizar el bus' });
    }

    res.json({ message: 'Bus actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar bus:', error);
    res.status(500).json({ message: 'Error al actualizar bus', error: error.message });
  }
});

// Eliminar bus (solo admin)
router.delete('/:id', [authenticateJWT, isAdmin, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    const deleted = await req.busModel.delete(busId);

    if (!deleted) {
      return res.status(400).json({ message: 'No se pudo eliminar el bus' });
    }

    res.json({ message: 'Bus eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar bus:', error);
    res.status(500).json({ message: 'Error al eliminar bus', error: error.message });
  }
});

// Actualizar contador de pasajeros (admin o conductor)
router.put('/:id/passenger-count', [authenticateJWT, isAdminOrDriver, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const { count, latitude, longitude } = req.body;

    if (count === undefined) {
      return res.status(400).json({ message: 'Contador de pasajeros requerido' });
    }

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    if (req.user.role === 'driver' && existingBus.driverId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este bus' });
    }

    await req.busModel.updatePassengerCount(busId, count);

    if (latitude !== undefined && longitude !== undefined) {
      await req.logModel.create({
        busId,
        passengerCount: count,
        latitude,
        longitude
      });
    } else {
      await req.logModel.create({
        busId,
        passengerCount: count
      });
    }

    res.json({ 
      message: 'Contador actualizado exitosamente',
      count
    });
  } catch (error) {
    console.error('Error al actualizar contador:', error);
    res.status(500).json({ message: 'Error al actualizar contador', error: error.message });
  }
});

// Obtener logs de ocupación de un bus
router.get('/:id/occupancy-logs', [authenticateJWT, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const { startDate, endDate, limit } = req.query;

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    if (req.user.role === 'driver' && existingBus.driverId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este bus' });
    }

    const logs = await req.logModel.findByBusId(busId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined
    });

    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ message: 'Error al obtener logs', error: error.message });
  }
});

// Obtener estadísticas de ocupación de un bus
router.get('/:id/occupancy-stats', [authenticateJWT, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const { startDate, endDate, limit } = req.query;

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    if (req.user.role === 'driver' && existingBus.driverId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este bus' });
    }

    const stats = await req.logModel.getStatsByBusId(busId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined
    });

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

// Obtener estadísticas por hora para un día específico
router.get('/:id/hourly-stats/:date', [authenticateJWT, getModels], async (req, res) => {
  try {
    const busId = parseInt(req.params.id, 10);
    const date = req.params.date; 

    const existingBus = await req.busModel.findById(busId);
    if (!existingBus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }

    if (req.user.role === 'driver' && existingBus.driverId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este bus' });
    }

    const hourlyStats = await req.logModel.getHourlyStatsByBusId(busId, date);

    res.json(hourlyStats);
  } catch (error) {
    console.error('Error al obtener estadísticas por hora:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por hora', error: error.message });
  }
});

module.exports = router;