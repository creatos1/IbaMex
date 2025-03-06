
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PassengerSensorStats from '../PassengerSensorStats';

export default function DriverDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOnRoute, setIsOnRoute] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);
  const [passengerCount, setPassengerCount] = useState(0);
  const [routeStartTime, setRouteStartTime] = useState<Date | null>(null);
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#1c1c1c' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  
  useEffect(() => {
    // Cargar estado de ruta al iniciar
    const loadRouteStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('driver_route_status');
        const savedRoute = await AsyncStorage.getItem('driver_current_route');
        const savedCount = await AsyncStorage.getItem('driver_passenger_count');
        const savedStartTime = await AsyncStorage.getItem('driver_route_start_time');
        
        if (savedStatus) setIsOnRoute(savedStatus === 'true');
        if (savedRoute) setCurrentRoute(savedRoute);
        if (savedCount) setPassengerCount(parseInt(savedCount, 10));
        if (savedStartTime) setRouteStartTime(new Date(savedStartTime));
      } catch (error) {
        console.error('Error cargando estado de ruta:', error);
      }
    };
    
    loadRouteStatus();
  }, []);
  
  const toggleRouteStatus = async () => {
    const newStatus = !isOnRoute;
    setIsOnRoute(newStatus);
    
    if (newStatus) {
      // Iniciar nueva ruta
      const routes = ['R1-Centro', 'R2-Norte', 'R3-Universidad', 'R4-Aeropuerto'];
      const selectedRoute = routes[Math.floor(Math.random() * routes.length)];
      setCurrentRoute(selectedRoute);
      setPassengerCount(0);
      const now = new Date();
      setRouteStartTime(now);
      
      // Guardar en storage
      await AsyncStorage.setItem('driver_route_status', 'true');
      await AsyncStorage.setItem('driver_current_route', selectedRoute);
      await AsyncStorage.setItem('driver_passenger_count', '0');
      await AsyncStorage.setItem('driver_route_start_time', now.toISOString());
      
      // Publicar mensaje MQTT
      const message = JSON.stringify({ 
        busId: `BUS-${user?.id?.substring(0, 4)}`,
        routeId: selectedRoute,
        status: 'active',
        timestamp: now.toISOString(),
        batteryLevel: 95
      });
      
      if (typeof PassengerSensorStats.publishMessage === 'function') {
        PassengerSensorStats.publishMessage('ibamex/bus/status', message);
      }
    } else {
      // Finalizar ruta
      await AsyncStorage.setItem('driver_route_status', 'false');
      
      // Publicar mensaje MQTT
      const message = JSON.stringify({ 
        busId: `BUS-${user?.id?.substring(0, 4)}`,
        routeId: currentRoute,
        status: 'inactive',
        timestamp: new Date().toISOString(),
        batteryLevel: 90
      });
      
      if (typeof PassengerSensorStats.publishMessage === 'function') {
        PassengerSensorStats.publishMessage('ibamex/bus/status', message);
      }
    }
  };
  
  const addPassenger = async () => {
    if (!isOnRoute) return;
    
    const newCount = passengerCount + 1;
    setPassengerCount(newCount);
    await AsyncStorage.setItem('driver_passenger_count', newCount.toString());
    
    // Publicar mensaje MQTT
    const message = JSON.stringify({ 
      busId: `BUS-${user?.id?.substring(0, 4)}`,
      routeId: currentRoute,
      count: 1,
      timestamp: new Date().toISOString()
    });
    
    if (typeof PassengerSensorStats.publishMessage === 'function') {
      PassengerSensorStats.publishMessage('ibamex/bus/passenger/count', message);
    }
  };
  
  const handleLogout = async () => {
    // Finalizar ruta si está activa antes de cerrar sesión
    if (isOnRoute) {
      await AsyncStorage.setItem('driver_route_status', 'false');
      
      // Publicar mensaje MQTT de cierre
      const message = JSON.stringify({ 
        busId: `BUS-${user?.id?.substring(0, 4)}`,
        routeId: currentRoute,
        status: 'inactive',
        timestamp: new Date().toISOString(),
        batteryLevel: 90
      });
      
      if (typeof PassengerSensorStats.publishMessage === 'function') {
        PassengerSensorStats.publishMessage('ibamex/bus/status', message);
      }
    }
    
    await logout();
    router.replace('/');
  };
  
  const formatTime = (date: Date | null) => {
    if (!date) return "00:00:00";
    return date.toTimeString().split(' ')[0];
  };
  
  const getElapsedTime = () => {
    if (!routeStartTime || !isOnRoute) return "00:00:00";
    
    const now = new Date();
    const diffMs = now.getTime() - routeStartTime.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOnRoute) {
      // Actualizar tiempo transcurrido cada segundo
      timer = setInterval(() => {
        setRouteStartTime(prev => prev); // Forzar re-render
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOnRoute]);
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Hola, {user?.username || 'Conductor'}</ThemedText>
          <ThemedText style={styles.subtitle}>Panel de conductor</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.routeStatusCard}>
          <View style={styles.routeStatusHeader}>
            <ThemedText style={styles.routeStatusTitle}>Estado de Ruta</ThemedText>
            <View style={styles.toggleContainer}>
              <ThemedText style={styles.toggleLabel}>{isOnRoute ? 'Activo' : 'Inactivo'}</ThemedText>
              <Switch
                value={isOnRoute}
                onValueChange={toggleRouteStatus}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={isOnRoute ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {isOnRoute && (
            <View style={styles.activeRouteInfo}>
              <View style={styles.routeDetail}>
                <ThemedText style={styles.routeDetailLabel}>Ruta:</ThemedText>
                <ThemedText style={styles.routeDetailValue}>{currentRoute}</ThemedText>
              </View>
              
              <View style={styles.routeDetail}>
                <ThemedText style={styles.routeDetailLabel}>Inicio:</ThemedText>
                <ThemedText style={styles.routeDetailValue}>{formatTime(routeStartTime)}</ThemedText>
              </View>
              
              <View style={styles.routeDetail}>
                <ThemedText style={styles.routeDetailLabel}>Tiempo transcurrido:</ThemedText>
                <ThemedText style={styles.routeDetailValue}>{getElapsedTime()}</ThemedText>
              </View>
              
              <View style={styles.routeDetail}>
                <ThemedText style={styles.routeDetailLabel}>Pasajeros:</ThemedText>
                <ThemedText style={styles.routeDetailValue}>{passengerCount}</ThemedText>
              </View>
              
              <TouchableOpacity 
                style={[styles.addPassengerButton, { backgroundColor: primaryColor }]}
                onPress={addPassenger}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <ThemedText style={styles.addPassengerText}>Añadir Pasajero</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
        
        <PassengerSensorStats />
        
        <ThemedText style={styles.sectionTitle}>Acciones Rápidas</ThemedText>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => Alert.alert('Incidencia', 'Función de reporte de incidencias en desarrollo')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F44336' }]}>
              <Ionicons name="warning" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Reportar Incidencia</ThemedText>
            <ThemedText style={styles.cardDescription}>Notificar problemas en ruta</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Horarios</ThemedText>
            <ThemedText style={styles.cardDescription}>Ver asignaciones de ruta</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(tabs)/map')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="map" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Mapa en vivo</ThemedText>
            <ThemedText style={styles.cardDescription}>Ver ubicación actual</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => Alert.alert('Mantenimiento', 'Función de solicitud de mantenimiento en desarrollo')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFC107' }]}>
              <Ionicons name="build" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Mantenimiento</ThemedText>
            <ThemedText style={styles.cardDescription}>Solicitar revisión del vehículo</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  routeStatusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  routeStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    fontWeight: '500',
  },
  activeRouteInfo: {
    marginTop: 16,
  },
  routeDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeDetailLabel: {
    fontWeight: '500',
  },
  routeDetailValue: {
    opacity: 0.8,
  },
  addPassengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addPassengerText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  logoutContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '500',
  },
});
