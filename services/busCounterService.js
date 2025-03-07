const { connect } = require('mqtt/dist/mqtt');
const Bus = require('../models/busModel');
const OccupancyLog = require('../models/occupancyLogModel');
const Route = require('../models/routeModel');

// Configuración MQTT
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_COUNT = 'ibamex/bus/passenger/count';
const MQTT_TOPIC_STATUS = 'ibamex/bus/status';

class BusCounterService {
  constructor() {
    this.client = null;
    this.options = {
      clientId: `ibamex_server_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
    };
    this.init();
  }

  init() {
    try {
      console.log('Inicializando servicio de contador de pasajeros...');
      const brokerUrl = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
      this.client = mqtt.connect(brokerUrl, this.options);

      this.client.on('connect', () => {
        console.log('Conectado al broker MQTT:', brokerUrl);
        this.subscribe();
      });

      this.client.on('error', (err) => {
        console.error('Error en la conexión MQTT:', err);
        if (this.client && this.client.end) {
          this.client.end();
        }
        setTimeout(() => this.init(), 10000); // Reintentar en 10 segundos
      });

      this.client.on('close', () => {
        console.log('Conexión MQTT cerrada');
      });

      this.client.on('offline', () => {
        console.log('Cliente MQTT desconectado');
      });

      this.client.on('reconnect', () => {
        console.log('Intentando reconectar a MQTT...');
      });

      process.on('SIGINT', () => {
        if (this.client) {
          console.log('Cerrando conexión MQTT...');
          this.client.end(true);
        }
        process.exit(0);
      });

    } catch (error) {
      console.error('Error al inicializar BusCounterService:', error);
      setTimeout(() => this.init(), 10000); // Reintentar en 10 segundos
    }
  }

  subscribe() {
    try {
      const countTopic = process.env.MQTT_TOPIC_COUNT || 'ibamex/bus/passenger/count';
      const statusTopic = process.env.MQTT_TOPIC_STATUS || 'ibamex/bus/status';

      this.client.subscribe([countTopic, statusTopic], { qos: 1 }, (err) => {
        if (err) {
          console.error('Error al suscribirse a los tópicos:', err);
          return;
        }
        console.log(`Suscrito a los tópicos: ${countTopic}, ${statusTopic}`);
      });

      this.client.on('message', this.handleMessage.bind(this));
    } catch (error) {
      console.error('Error en la suscripción MQTT:', error);
    }
  }

  async handleMessage(topic, message) {
    try {
      const payload = message.toString();
      console.log(`Mensaje recibido en ${topic}: ${payload}`);

      // Procesar tópico de conteo de pasajeros
      if (topic === process.env.MQTT_TOPIC_COUNT) {
        await this.processCountMessage(payload);
      } 
      // Procesar tópico de estado del bus
      else if (topic === process.env.MQTT_TOPIC_STATUS) {
        await this.processStatusMessage(payload);
      }
    } catch (error) {
      console.error('Error al procesar mensaje MQTT:', error);
    }
  }

  async processCountMessage(payload) {
    try {
      const data = JSON.parse(payload);

      if (!data.busId || data.count === undefined) {
        console.error('Mensaje de conteo incompleto:', payload);
        return;
      }

      // Registrar en log de ocupación  (Needs SQL implementation)
      const log = new OccupancyLog({
        busId: data.busId,
        routeId: data.routeId || 'UNKNOWN',
        count: data.count,
        timestamp: new Date()
      });
      await log.save();

      // Actualizar bus (Needs SQL implementation)
      const bus = await Bus.findOne({ busId: data.busId });
      if (bus) {
        bus.currentOccupancy = data.count;
        bus.lastUpdated = new Date();
        await bus.save();
        console.log(`Bus ${data.busId} actualizado: ${data.count} pasajeros`);
      } else {
        // Crear bus si no existe (Needs SQL implementation)
        const newBus = new Bus({
          busId: data.busId,
          routeId: data.routeId || 'UNKNOWN',
          capacity: 40, // Capacidad por defecto
          currentOccupancy: data.count,
          status: 'active',
          batteryLevel: 100,
          lastUpdated: new Date()
        });
        await newBus.save();
        console.log(`Nuevo bus registrado: ${data.busId}`);
      }
    } catch (error) {
      console.error('Error al procesar mensaje de conteo:', error);
    }
  }

  async processStatusMessage(payload) {
    try {
      const data = JSON.parse(payload);

      if (!data.busId) {
        console.error('Mensaje de estado incompleto:', payload);
        return;
      }

      // Actualizar estado del bus (Needs SQL implementation)
      const bus = await Bus.findOne({ busId: data.busId });
      if (bus) {
        if (data.status) bus.status = data.status;
        if (data.batteryLevel !== undefined) bus.batteryLevel = data.batteryLevel;
        if (data.routeId) bus.routeId = data.routeId;
        bus.lastUpdated = new Date();
        await bus.save();
        console.log(`Estado del bus ${data.busId} actualizado`);
      } else {
        console.log(`Bus ${data.busId} no encontrado para actualizar estado`);
      }
    } catch (error) {
      console.error('Error al procesar mensaje de estado:', error);
    }
  }
}

module.exports = BusCounterService;