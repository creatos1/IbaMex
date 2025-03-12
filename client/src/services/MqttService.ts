
import { useState, useEffect } from 'react';
import * as Mqtt from 'react-native-mqtt';

// Configurar MQTT
Mqtt.setDefaultHost('broker.emqx.io');
Mqtt.setDefaultPort(1883);

interface MqttConnectionOptions {
  host?: string;
  port?: number;
  clientId: string;
  topics: string[];
}

export const useMqttConnection = (options: MqttConnectionOptions) => {
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{[topic: string]: any}>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configurar cliente MQTT
    const mqttClient = new Mqtt.Client(
      options.host || 'broker.emqx.io', 
      options.port || 1883, 
      options.clientId
    );
    
    // Configurar callbacks
    mqttClient.on('connect', () => {
      console.log('MQTT conectado!');
      setIsConnected(true);
      setError(null);
      
      // Suscribirse a tópicos
      options.topics.forEach(topic => {
        mqttClient.subscribe(topic, 0);
        console.log(`Suscrito a ${topic}`);
      });
    });
    
    mqttClient.on('message', (topic, payload) => {
      try {
        const msg = payload.toString();
        console.log(`Mensaje recibido en ${topic}: ${msg}`);
        
        try {
          const jsonData = JSON.parse(msg);
          setMessages(prev => ({ ...prev, [topic]: jsonData }));
        } catch (e) {
          setMessages(prev => ({ ...prev, [topic]: msg }));
        }
      } catch (e) {
        console.error('Error al procesar mensaje MQTT:', e);
      }
    });
    
    mqttClient.on('error', (err) => {
      console.error('Error MQTT:', err);
      setError(`Error MQTT: ${err.message}`);
    });
    
    mqttClient.on('close', () => {
      console.log('Conexión MQTT cerrada');
      setIsConnected(false);
    });
    
    // Conectar
    mqttClient.connect();
    setClient(mqttClient);
    
    // Limpieza al desmontar
    return () => {
      if (mqttClient && mqttClient.isConnected()) {
        options.topics.forEach(topic => mqttClient.unsubscribe(topic));
        mqttClient.disconnect();
      }
    };
  }, [options.host, options.port, options.clientId, JSON.stringify(options.topics)]);
  
  // Función para publicar mensajes
  const publish = (topic: string, message: any) => {
    if (!client || !isConnected) {
      console.error('No se puede publicar: cliente no conectado');
      return false;
    }
    
    try {
      const payload = typeof message === 'object' 
        ? JSON.stringify(message)
        : message.toString();
        
      client.publish(topic, payload, 0, false);
      return true;
    } catch (e) {
      console.error('Error al publicar:', e);
      return false;
    }
  };
  
  return { isConnected, messages, error, publish };
};
