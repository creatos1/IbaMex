
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize MQTT
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {}
});

interface SensorData {
  lastReading: Date;
  totalDetections: number;
  busId: string;
  routeId: string;
  batteryLevel?: number;
  isOnline: boolean;
}

// MQTT configuration - using the same broker as in the Arduino code
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_COUNT = 'ibamex/bus/passenger/count';
const MQTT_TOPIC_STATUS = 'ibamex/bus/status';

// Initial dummy data (will be replaced with real data)
const initialData: SensorData = {
  lastReading: new Date(),
  totalDetections: 0,
  busId: 'Unknown',
  routeId: 'Unknown',
  batteryLevel: 100,
  isOnline: false
};

export default function PassengerSensorStats() {
  const [sensorData, setSensorData] = useState<SensorData>(initialData);
  const [client, setClient] = useState<any>(null);
  const accentColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Setup MQTT connection
  useEffect(() => {
    // Create MQTT client
    const clientId = 'ibamex_app_' + Math.random().toString(16).substring(2, 8);
    const mqttClient = new Paho.MQTT.Client(MQTT_BROKER.replace('mqtt://', ''), 8884, clientId);

    // Set callback handlers
    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    // Connect
    mqttClient.connect({
      onSuccess: onConnect,
      useSSL: true,
      onFailure: (e) => console.error("MQTT Connection failed: ", e)
    });

    setClient(mqttClient);

    // Clean up on unmount
    return () => {
      if (mqttClient && mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, []);

  // MQTT connection handlers
  const onConnect = () => {
    console.log('MQTT Connected');
    if (client) {
      client.subscribe(MQTT_TOPIC_COUNT);
      client.subscribe(MQTT_TOPIC_STATUS);
      setSensorData(prev => ({ ...prev, isOnline: true }));
    }
  };

  const onConnectionLost = (responseObject: any) => {
    if (responseObject.errorCode !== 0) {
      console.log('MQTT Connection lost: ' + responseObject.errorMessage);
      setSensorData(prev => ({ ...prev, isOnline: false }));
    }
  };

  const onMessageArrived = (message: any) => {
    console.log('MQTT Message received: ' + message.payloadString);
    try {
      const data = JSON.parse(message.payloadString);
      
      if (message.destinationName === MQTT_TOPIC_COUNT) {
        setSensorData(prev => ({
          ...prev,
          lastReading: new Date(),
          totalDetections: data.count || prev.totalDetections,
          busId: data.busId || prev.busId,
          routeId: data.routeId || prev.routeId,
          isOnline: true
        }));
      } else if (message.destinationName === MQTT_TOPIC_STATUS) {
        // Handle status updates
        setSensorData(prev => ({
          ...prev,
          lastReading: new Date(),
          busId: data.busId || prev.busId,
          routeId: data.routeId || prev.routeId,
          batteryLevel: data.batteryLevel !== undefined ? data.batteryLevel : prev.batteryLevel,
          isOnline: data.status === 'active'
        }));
      }
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  };

  // Formatear tiempo transcurrido
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seg`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    return `${Math.floor(seconds / 86400)} d`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Sensor de Pasajeros ESP32</ThemedText>
        <View style={[styles.statusIndicator, { backgroundColor: sensorData.isOnline ? '#4CAF50' : '#F44336' }]} />
      </View>

      <ThemedView style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={accentColor} />
          <ThemedText style={styles.statValue}>{sensorData.totalDetections}</ThemedText>
          <ThemedText style={styles.statLabel}>Pasajeros detectados</ThemedText>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={accentColor} />
          <ThemedText style={styles.statValue}>{getTimeAgo(sensorData.lastReading)}</ThemedText>
          <ThemedText style={styles.statLabel}>Última lectura</ThemedText>
        </View>

        {sensorData.batteryLevel !== undefined && (
          <View style={styles.statItem}>
            <Ionicons 
              name={sensorData.batteryLevel > 20 ? "battery-half" : "battery-dead"} 
              size={24} 
              color={accentColor} 
            />
            <ThemedText style={styles.statValue}>{sensorData.batteryLevel}%</ThemedText>
            <ThemedText style={styles.statLabel}>Batería</ThemedText>
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Bus ID: </ThemedText>
          {sensorData.busId}
        </ThemedText>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Ruta: </ThemedText>
          {sensorData.routeId}
        </ThemedText>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Estado: </ThemedText>
          {sensorData.isOnline ? 'Activo' : 'Inactivo'}
        </ThemedText>
        <ThemedText style={[styles.connectionStatus, { color: sensorData.isOnline ? '#4CAF50' : '#F44336' }]}>
          {sensorData.isOnline ? 'Conectado en tiempo real' : 'Esperando conexión...'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  connectionStatus: {
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
