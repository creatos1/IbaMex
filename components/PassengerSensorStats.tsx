
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SensorData {
  lastReading: Date;
  totalDetections: number;
  busId: string;
  routeId: string;
  batteryLevel?: number;
  isOnline: boolean;
}

// Simulation configuration
const SIMULATE_REAL_TIME_DATA = true; // Set to true to simulate real-time data
const UPDATE_INTERVAL = 5000; // milliseconds

// Initial data for simulation
const initialData: SensorData = {
  lastReading: new Date(),
  totalDetections: Math.floor(Math.random() * 50), // Start with some random detections
  busId: 'BUS101',
  routeId: 'R1-Centro',
  batteryLevel: 95 + Math.floor(Math.random() * 6), // Start between 95-100%
  isOnline: true
};

export default function PassengerSensorStats() {
  const [sensorData, setSensorData] = useState<SensorData>(initialData);
  const accentColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Setup simulated data updates
  useEffect(() => {
    let isActive = true;
    
    const simulateRealTimeData = () => {
      if (!isActive) return;
      
      // Simulate a new random count increase (0-5 passengers)
      const newPassengers = Math.floor(Math.random() * 6);
      
      // Simulate a random battery decrease (0-2%)
      const batteryDecrease = Math.random() * 2;
      
      // Random bus ID (for simulation)
      const busIds = ['BUS101', 'BUS102', 'BUS103', 'BUS104'];
      const routeIds = ['R1-Centro', 'R2-Norte', 'R3-Universidad', 'R4-Aeropuerto'];
      
      setSensorData(prev => ({
        lastReading: new Date(),
        totalDetections: prev.totalDetections + newPassengers,
        busId: busIds[Math.floor(Math.random() * busIds.length)],
        routeId: routeIds[Math.floor(Math.random() * routeIds.length)],
        batteryLevel: Math.max(0, (prev.batteryLevel || 100) - batteryDecrease),
        isOnline: Math.random() > 0.1 // 90% chance of being online
      }));
    };
    
    // Initial update
    if (SIMULATE_REAL_TIME_DATA) {
      simulateRealTimeData();
      
      // Set up interval for updates
      const intervalId = setInterval(simulateRealTimeData, UPDATE_INTERVAL);
      
      // Clean up on unmount
      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }
  }, []);

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
