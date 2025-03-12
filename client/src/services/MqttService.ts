
import { useState, useEffect } from 'react';
import { Client, Message } from 'paho-mqtt';

// MqttService hook
export const useMqttConnection = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<{topic: string, message: any} | null>(null);

  useEffect(() => {
    // Create client ID with random string
    const clientId = 'ibamex_mobile_' + Math.random().toString(16).substring(2, 8);
    
    try {
      // Connect using WebSocket (works with React Native)
      const mqttClient = new Client(
        'broker.emqx.io', // Broker host
        8083,            // WebSocket port for non-SSL
        '/mqtt',         // Path
        clientId         // Client ID
      );

      // Set callbacks
      mqttClient.onConnectionLost = (responseObject) => {
        console.log('Connection lost:', responseObject.errorMessage);
        setIsConnected(false);
      };

      mqttClient.onMessageArrived = (message: Message) => {
        console.log('Message received:', message.destinationName, message.payloadString);
        try {
          const payload = JSON.parse(message.payloadString);
          setLastMessage({
            topic: message.destinationName,
            message: payload
          });
        } catch (e) {
          console.error('Error parsing MQTT message:', e);
        }
      };

      // Connect with timeout and retry logic
      const connectWithRetry = (retries = 3) => {
        try {
          mqttClient.connect({
            useSSL: false, // Change to false for non-SSL connection
            timeout: 10, // Shorter timeout
            onSuccess: () => {
              console.log('MQTT Connected successfully');
              setIsConnected(true);
              
              // Subscribe to topics
              try {
                mqttClient.subscribe('buses/+/count');
                console.log('Subscribed to topic: buses/+/count');
              } catch (subError) {
                console.error('Error subscribing to topic:', subError);
              }
            },
            onFailure: (err) => {
              console.error('MQTT Connection failed:', err.errorMessage);
              if (retries > 0) {
                console.log(`Retrying connection... (${retries} attempts left)`);
                setTimeout(() => connectWithRetry(retries - 1), 3000);
              } else {
                console.error('Max retries reached, could not connect to MQTT broker');
                setIsConnected(false);
                
                // Activate simulation mode here if needed
                console.log('Activating simulation mode');
              }
            }
          });
        } catch (error) {
          console.error('Error during MQTT connection attempt:', error);
          setIsConnected(false);
        }
      };

      // Start connection process
      connectWithRetry();
      setClient(mqttClient);

      // Cleanup on unmount
      return () => {
        if (mqttClient) {
          try {
            if (mqttClient.isConnected()) {
              mqttClient.disconnect();
            }
            console.log('MQTT client disconnected');
          } catch (e) {
            console.error('Error disconnecting MQTT client:', e);
          }
        }
      };
    } catch (error) {
      console.error('Error setting up MQTT client:', error);
    }
  }, []);

  const publishMessage = (topic: string, message: any) => {
    if (!client || !isConnected) {
      console.warn('Cannot publish: MQTT client not connected');
      return false;
    }
    
    try {
      const payload = JSON.stringify(message);
      const mqttMessage = new Message(payload);
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(`Published message to ${topic}:`, payload);
      return true;
    } catch (error) {
      console.error('Error publishing MQTT message:', error);
      return false;
    }
  };

  return {
    isConnected,
    lastMessage,
    publishMessage
  };
};
