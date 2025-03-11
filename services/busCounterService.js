
const mqtt = require('mqtt');
const BusModel = require('../models/busModel');
const OccupancyLogModel = require('../models/occupancyLogModel');

class BusCounterService {
  constructor(sqlConnection, mqttConfig) {
    this.busModel = new BusModel(sqlConnection);
    this.logModel = new OccupancyLogModel(sqlConnection);
    this.mqttConfig = mqttConfig || {
      host: process.env.MQTT_HOST || 'broker.emqx.io',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
      protocol: process.env.MQTT_PROTOCOL || 'mqtt',
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    };
    
    this.client = null;
    this.isConnected = false;
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Crear URL de conexión
        const connectUrl = `${this.mqttConfig.protocol}://${this.mqttConfig.host}:${this.mqttConfig.port}`;
        
        // Opciones de conexión
        const options = {
          clean: true,
          connectTimeout: 4000,
          clientId: `utasoft_server_${Math.random().toString(16).slice(2, 8)}`
        };
        
        // Añadir credenciales si están configuradas
        if (this.mqttConfig.username && this.mqttConfig.password) {
          options.username = this.mqttConfig.username;
          options.password = this.mqttConfig.password;
        }
        
        // Conectar al broker MQTT
        this.client = mqtt.connect(connectUrl, options);
        
        // Manejar eventos de conexión
        this.client.on('connect', () => {
          console.log('Conectado a MQTT broker');
          this.isConnected = true;
          
          // Suscribirse a tópicos relevantes
          this.client.subscribe(['buses/+/count', 'buses/+/location'], (err) => {
            if (err) {
              console.error('Error al suscribirse a tópicos:', err);
              reject(err);
              return;
            }
            console.log('Suscrito a tópicos MQTT para buses');
            resolve();
          });
        });
        
        // Manejar mensajes entrantes
        this.client.on('message', (topic, payload) => {
          try {
            // Procesar mensaje
            const topicParts = topic.split('/');
            if (topicParts.length !== 3) return;
            
            const busId = topicParts[1];
            const messageType = topicParts[2];
            
            const message = JSON.parse(payload.toString());
            
            // Procesar según tipo de mensaje
            if (messageType === 'count') {
              this.handlePassengerCount(busId, message);
            } else if (messageType === 'location') {
              this.handleLocationUpdate(busId, message);
            }
          } catch (error) {
            console.error('Error al procesar mensaje MQTT:', error);
          }
        });
        
        // Manejar errores
        this.client.on('error', (error) => {
          console.error('Error MQTT:', error);
          this.isConnected = false;
          reject(error);
        });
        
        // Manejar desconexión
        this.client.on('close', () => {
          console.log('Desconectado de MQTT broker');
          this.isConnected = false;
        });
        
      } catch (error) {
        console.error('Error al configurar cliente MQTT:', error);
        reject(error);
      }
    });
  }
  
  disconnect() {
    if (this.client && this.isConnected) {
      this.client.end();
      this.isConnected = false;
      console.log('Desconectado del broker MQTT');
    }
  }
  
  async handlePassengerCount(busIdStr, message) {
    try {
      if (typeof message !== 'object' || message.count === undefined) {
        console.error('Formato de mensaje inválido para contador de pasajeros');
        return;
      }
      
      // Buscar bus por busId (identificador externo)
      const bus = await this.busModel.findByBusId(busIdStr);
      if (!bus) {
        console.error(`Bus no encontrado: ${busIdStr}`);
        return;
      }
      
      const count = parseInt(message.count, 10);
      if (isNaN(count)) {
        console.error(`Contador inválido: ${message.count}`);
        return;
      }
      
      // Actualizar contador de pasajeros
      await this.busModel.updatePassengerCount(bus.id, count);
      
      // Registrar en el log
      const logData = { 
        busId: bus.id, 
        passengerCount: count 
      };
      
      // Añadir ubicación si está disponible
      if (message.latitude !== undefined && message.longitude !== undefined) {
        logData.latitude = parseFloat(message.latitude);
        logData.longitude = parseFloat(message.longitude);
      }
      
      await this.logModel.create(logData);
      
      console.log(`Contador actualizado para bus ${busIdStr}: ${count} pasajeros`);
    } catch (error) {
      console.error('Error al procesar contador de pasajeros:', error);
    }
  }
  
  async handleLocationUpdate(busIdStr, message) {
    try {
      if (typeof message !== 'object' || message.latitude === undefined || message.longitude === undefined) {
        console.error('Formato de mensaje inválido para actualización de ubicación');
        return;
      }
      
      // Buscar bus por busId (identificador externo)
      const bus = await this.busModel.findByBusId(busIdStr);
      if (!bus) {
        console.error(`Bus no encontrado: ${busIdStr}`);
        return;
      }
      
      const latitude = parseFloat(message.latitude);
      const longitude = parseFloat(message.longitude);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(`Coordenadas inválidas: ${message.latitude}, ${message.longitude}`);
        return;
      }
      
      // Actualizar ubicación del bus
      await this.busModel.update(bus.id, {
        currentLocation: { latitude, longitude },
        lastPing: new Date()
      });
      
      console.log(`Ubicación actualizada para bus ${busIdStr}: ${latitude}, ${longitude}`);
    } catch (error) {
      console.error('Error al procesar actualización de ubicación:', error);
    }
  }
  
  // Método para publicar un mensaje (útil para pruebas o enviar comandos)
  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.error('No hay conexión MQTT activa');
      return false;
    }
    
    this.client.publish(topic, JSON.stringify(message));
    return true;
  }
}

module.exports = BusCounterService;
