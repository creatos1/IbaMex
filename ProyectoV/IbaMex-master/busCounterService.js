
const mongoose = require('mongoose');
const mqtt = require('mqtt');

// Configuración MQTT
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_COUNT = 'ibamex/bus/passenger/count';
const MQTT_TOPIC_STATUS = 'ibamex/bus/status';

// Modelos requeridos (asumimos que ya están definidos en server.js)
const Bus = mongoose.model('Bus');
const OccupancyLog = mongoose.model('OccupancyLog');

class BusCounterService {
  constructor() {
    this.client = mqtt.connect(MQTT_BROKER);
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
    console.log('Recibido conteo de pasajeros:', data);
    const { busId, count } = data;
    
    try {
      // Buscar el bus en la base de datos
      const bus = await Bus.findOne({ registrationNumber: busId });
      
      if (bus) {
        // Actualizar ocupación actual
        const oldOccupancy = bus.currentOccupancy || 0;
        bus.currentOccupancy = count;
        await bus.save();
        
        // Registrar el cambio de ocupación
        await OccupancyLog.create({
          busId: bus._id,
          timestamp: new Date(),
          occupancy: count,
          stopName: 'Sensor ESP32' // Se podría mejorar con datos de ubicación
        });
        
        console.log(`Bus ${busId} actualizado: ocupación ${oldOccupancy} -> ${count}`);
      } else {
        console.log(`Bus con ID ${busId} no encontrado en la base de datos`);
      }
    } catch (error) {
      console.error('Error actualizando bus:', error);
    }
  }

  async handleBusStatus(data) {
    console.log('Recibido estado del bus:', data);
    // Procesar actualizaciones de estado (ubicación, disponibilidad, etc.)
  }
}

module.exports = BusCounterService;
