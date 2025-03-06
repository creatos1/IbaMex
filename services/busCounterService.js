
const mongoose = require('mongoose');
const { connect } = require('mqtt');
const Bus = require('../models/Bus');
const OccupancyLog = require('../models/OccupancyLog');

// Configuración MQTT
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_COUNT = 'ibamex/bus/passenger/count';
const MQTT_TOPIC_STATUS = 'ibamex/bus/status';

class BusCounterService {
  constructor() {
    this.client = connect(MQTT_BROKER);
    this.setupMqttClient();
  }

  setupMqttClient() {
    this.client.on('connect', () => {
      console.log('Conectado al broker MQTT');
      
      // Suscribirse a temas
      this.client.subscribe(MQTT_TOPIC_COUNT, (err) => {
        if (!err) {
          console.log(`Suscrito a ${MQTT_TOPIC_COUNT}`);
        }
      });
      
      this.client.subscribe(MQTT_TOPIC_STATUS, (err) => {
        if (!err) {
          console.log(`Suscrito a ${MQTT_TOPIC_STATUS}`);
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (topic === MQTT_TOPIC_COUNT) {
          await this.handlePassengerCount(data);
        } else if (topic === MQTT_TOPIC_STATUS) {
          await this.handleBusStatus(data);
        }
      } catch (error) {
        console.error('Error procesando mensaje MQTT:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('Error en cliente MQTT:', error);
    });
  }

  async handlePassengerCount(data) {
    try {
      const { busId, routeId, count } = data;
      
      // Registrar el conteo en el historial
      await OccupancyLog.create({
        busId,
        routeId,
        count
      });
      
      // Actualizar el estado del bus
      const bus = await Bus.findOne({ busId });
      
      if (bus) {
        // Actualizar el bus existente
        bus.currentOccupancy = count;
        bus.lastUpdated = new Date();
        await bus.save();
      } else {
        // Crear un nuevo bus si no existe
        await Bus.create({
          busId,
          routeId,
          currentOccupancy: count,
          lastUpdated: new Date()
        });
      }
      
      console.log(`Conteo actualizado para bus ${busId}: ${count} pasajeros`);
    } catch (error) {
      console.error('Error al procesar conteo de pasajeros:', error);
    }
  }

  async handleBusStatus(data) {
    try {
      const { busId, routeId, batteryLevel, status } = data;
      
      // Actualizar el estado del bus
      const bus = await Bus.findOne({ busId });
      
      if (bus) {
        // Actualizar propiedades
        if (batteryLevel !== undefined) bus.batteryLevel = batteryLevel;
        if (status !== undefined) bus.status = status;
        bus.lastUpdated = new Date();
        
        await bus.save();
        console.log(`Estado del bus ${busId} actualizado`);
      } else {
        // Crear un nuevo bus
        await Bus.create({
          busId,
          routeId,
          batteryLevel: batteryLevel || 100,
          status: status || 'active',
          lastUpdated: new Date()
        });
        console.log(`Nuevo bus ${busId} registrado`);
      }
    } catch (error) {
      console.error('Error al procesar estado del bus:', error);
    }
  }
}

module.exports = BusCounterService;
