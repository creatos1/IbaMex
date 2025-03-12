
const mqtt = require('mqtt');
const BusModel = require('../models/busModel');
const OccupancyLogModel = require('../models/occupancyLogModel');

class MqttService {
  constructor(sqlConnection) {
    this.busModel = new BusModel(sqlConnection);
    this.logModel = new OccupancyLogModel(sqlConnection);
    this.client = null;
    this.isConnected = false;
    
    this.config = {
      host: process.env.MQTT_HOST || 'broker.emqx.io',
      port: parseInt(process.env.MQTT_PORT || '1883', 10),
      protocol: process.env.MQTT_PROTOCOL || 'mqtt'
    };
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const connectUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
        
        console.log(`Conectando a MQTT broker: ${connectUrl}`);
        
        const clientId = `utasoft_server_${Math.random().toString(16).slice(2, 8)}`;
        this.client = mqtt.connect(connectUrl, {
          clientId,
          clean: true,
          connectTimeout: 4000
        });
        
        this.client.on('connect', () => {
          console.log('✅ Conectado a MQTT broker');
          this.isConnected = true;
          
          // Suscribirse a todos los tópicos de buses
          this.client.subscribe('buses/+/count', (err) => {
            if (err) {
              console.error('Error al suscribirse:', err);
              reject(err);
              return;
            }
            console.log('Suscrito a tópicos de conteo de pasajeros');
            resolve();
          });
        });
        
        this.client.on('message', async (topic, payload) => {
          try {
            console.log(`Mensaje recibido en ${topic}: ${payload.toString()}`);
            
            // Extraer ID del bus desde el tópico (buses/ESP32_001/count)
            const topicParts = topic.split('/');
            if (topicParts.length !== 3) return;
            
            const busIdStr = topicParts[1];
            const messageType = topicParts[2];
            
            if (messageType === 'count') {
              const message = JSON.parse(payload.toString());
              
              // Buscar o crear el bus en la base de datos
              let bus = await this.busModel.findByBusId(busIdStr);
              
              if (!bus) {
                console.log(`Bus ${busIdStr} no encontrado, creando nuevo registro`);
                // Crear un nuevo bus si no existe
                const newBusId = await this.busModel.create({
                  busId: busIdStr,
                  name: `Bus ${busIdStr}`,
                  capacity: 50, // Valor por defecto
                  status: 'active'
                });
                
                bus = { id: newBusId };
              }
              
              // Actualizar contador y registrar
              if (message.count !== undefined) {
                const count = parseInt(message.count, 10);
                await this.busModel.updatePassengerCount(bus.id, count);
                
                // Crear log de ocupación
                await this.logModel.create({
                  busId: bus.id,
                  passengerCount: count
                });
                
                console.log(`Contador actualizado para bus ${busIdStr}: ${count}`);
              }
            }
          } catch (error) {
            console.error('Error al procesar mensaje MQTT:', error);
          }
        });
        
        this.client.on('error', (error) => {
          console.error('Error MQTT:', error);
          this.isConnected = false;
          reject(error);
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
  
  // Método para publicar un mensaje (útil para pruebas)
  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.error('No hay conexión MQTT activa');
      return false;
    }
    
    this.client.publish(topic, JSON.stringify(message));
    return true;
  }
}

module.exports = MqttService;
