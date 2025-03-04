
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SensorData {
  lastReading: Date;
  totalDetections: number;
  busId: string;
  routeId: string;
  batteryLevel?: number;
  isOnline: boolean;
}

const dummyData: SensorData = {
  lastReading: new Date(),
  totalDetections: 0,
  busId: 'BUS001',
  routeId: 'ROUTE001',
  batteryLevel: 85,
  isOnline: true
};

export default function PassengerSensorStats() {
  const [sensorData, setSensorData] = useState<SensorData>(dummyData);
  const accentColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Simular actualización de datos del sensor
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        lastReading: new Date(),
        totalDetections: prev.totalDetections + Math.floor(Math.random() * 3), // Simular detecciones aleatorias
        batteryLevel: prev.batteryLevel ? Math.max(prev.batteryLevel - 0.1, 0) : 0, // Simular descarga de batería
      }));
    }, 10000);

    return () => clearInterval(interval);
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
});
