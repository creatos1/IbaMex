import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useMqttConnection } from '../services/MqttService';
import { User } from '../services/AuthService';

interface PassengerCounterScreenProps {
  onLogout?: () => Promise<void>;
  user: User | null;
}

const PassengerCounterScreen: React.FC<PassengerCounterScreenProps> = ({ onLogout, user }) => {
  const [passengerCount, setPassengerCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [deviceId, setDeviceId] = useState('ESP8266_001');

  const { isConnected, lastMessage } = useMqttConnection();

  useEffect(() => {
    if (lastMessage && 
        lastMessage.topic === `buses/${deviceId}/count` && 
        lastMessage.message && 
        lastMessage.message.count !== undefined) {
      setPassengerCount(lastMessage.message.count);
      setLastUpdate(new Date());
    }
  }, [lastMessage, deviceId]);

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Sin actualizaciones';

    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);

    if (seconds < 60) return `Hace ${seconds} segundos`;
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    return `Hace ${Math.floor(seconds / 3600)} horas`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contador de Pasajeros</Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Bienvenido, {user.fullName || user.username}</Text>
              <Text style={styles.roleText}>Rol: {user.role}</Text>
            </View>
          )}
          {onLogout && (
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Pasajeros Actuales</Text>
          <Text style={styles.counterValue}>{passengerCount}</Text>
          <Text style={styles.updateTime}>{getTimeSinceUpdate()}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <View style={styles.connectionStatus}>
            <Text style={[styles.statusText, isConnected ? styles.connected : styles.disconnected]}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Los datos se actualizan automáticamente en tiempo real
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectionStatus: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  connected: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  disconnected: {
    backgroundColor: '#F44336',
    color: 'white',
  },
  simulation: {
    backgroundColor: '#FF9800',
    color: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#003366',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d'
  },
  counterContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  counterLabel: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8
  },
  counterValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16
  },
  updateTime: {
    fontSize: 14,
    color: '#6c757d'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  statusLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginRight: 8
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  errorText: {
    color: '#F44336',
    marginTop: 8
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto'
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center'
  },
  userInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 15,
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PassengerCounterScreen;