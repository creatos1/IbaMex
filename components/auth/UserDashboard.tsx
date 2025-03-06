
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import PassengerSensorStats from '../PassengerSensorStats';

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#1c1c1c' }, 'background');
  
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };
  
  const navigateTo = (screen: string) => {
    router.push(screen);
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Hola, {user?.username || 'Usuario'}</ThemedText>
          <ThemedText style={styles.subtitle}>Panel de usuario</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PassengerSensorStats />
        
        <ThemedText style={styles.sectionTitle}>Acciones Rápidas</ThemedText>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => navigateTo('/(tabs)/routes')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="map" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Ver Rutas</ThemedText>
            <ThemedText style={styles.cardDescription}>Explora las rutas disponibles</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => navigateTo('/(tabs)/schedule')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="time" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Horarios</ThemedText>
            <ThemedText style={styles.cardDescription}>Consulta los horarios de servicio</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => navigateTo('/(tabs)/notifications')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="notifications" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Notificaciones</ThemedText>
            <ThemedText style={styles.cardDescription}>Alertas e información importante</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => navigateTo('/(tabs)/help')}
          >
            <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
              <Ionicons name="help-circle" size={24} color="white" />
            </View>
            <ThemedText style={styles.cardTitle}>Ayuda</ThemedText>
            <ThemedText style={styles.cardDescription}>Preguntas frecuentes y soporte</ThemedText>
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
