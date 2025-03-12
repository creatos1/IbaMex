
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useMqttConnection } from '../services/MqttService';

export default function PassengerCounterScreen() {
  const [passengerCount, setPassengerCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [deviceId, setDeviceId] = useState('ESP32_001');
  
  // Conectar a MQTT
  const { isConnected, messages, error } = useMqttConnection({
    clientId: `mobile_app_${Math.random().toString(16).slice(2, 8)}`,
    topics: [`buses/${deviceId}/count`]
  });
  
  // Actualizar contador cuando llegan mensajes
  useEffect(() => {
    const topic = `buses/${deviceId}/count`;
    if (messages[topic] && messages[topic].count !== undefined) {
      setPassengerCount(messages[topic].count);
      setLastUpdate(new Date());
    }
  }, [messages, deviceId]);
  
  // Formatear tiempo desde la última actualización
  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Sin actualizaciones';
    
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    
    if (seconds < 60) return `Hace ${seconds} segundos`;
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    return `Hace ${Math.floor(seconds / 3600)} horas`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contador de Pasajeros</Text>
        <Text style={styles.subtitle}>Dispositivo: {deviceId}</Text>
      </View>
      
      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Pasajeros Actuales</Text>
        <Text style={styles.counterValue}>{passengerCount}</Text>
        <Text style={styles.updateTime}>{getTimeSinceUpdate()}</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Estado:</Text>
        <Text style={[
          styles.statusValue, 
          { color: isConnected ? '#4CAF50' : '#F44336' }
        ]}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Los datos se actualizan automáticamente en tiempo real
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  counterValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  updateTime: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
