
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';

interface StatsCard {
  title: string;
  value: number | string;
  icon: any;
  color: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#1c1c1c' }, 'background');
  const cardBackground = useThemeColor({ light: '#fff', dark: '#2a2a2a' }, 'background');
  
  // Datos de ejemplo para el dashboard
  const stats: StatsCard[] = [
    { title: 'Usuarios', value: 125, icon: 'people', color: '#4CAF50' },
    { title: 'Rutas', value: 8, icon: 'map', color: '#2196F3' },
    { title: 'Conductores', value: 12, icon: 'car', color: '#FFC107' },
    { title: 'Incidencias', value: 3, icon: 'warning', color: '#F44336' },
  ];
  
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Hola, {user?.username || 'Administrador'}</ThemedText>
          <ThemedText style={styles.subtitle}>Panel de administración</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.statCard, { backgroundColor: cardBackground }]}
              onPress={() => {
                if (stat.title === 'Usuarios') {
                  router.push('/(admin)/users');
                } else if (stat.title === 'Rutas') {
                  router.push('/(admin)/routes');
                } else if (stat.title === 'Conductores') {
                  router.push('/(admin)/drivers');
                } else if (stat.title === 'Incidencias') {
                  router.push('/(admin)/incidents');
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon} size={24} color="white" />
              </View>
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={styles.statTitle}>{stat.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        <ThemedText style={styles.sectionTitle}>Gestión del Sistema</ThemedText>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/users')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="people" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Gestión de Usuarios</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Administrar usuarios, conductores y roles</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/routes')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="map" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Gestión de Rutas</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Configurar rutas, paradas y horarios</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/analytics')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="bar-chart" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Análisis de Datos</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Estadísticas y reportes de uso</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/settings')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="settings" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Configuración</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Parámetros generales del sistema</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/maintenance')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="build" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Mantenimiento</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Solicitudes de mantenimiento y servicio</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor }]}
            onPress={() => router.push('/(admin)/notifications')}
          >
            <View style={styles.cardIconTitle}>
              <Ionicons name="notifications" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Notificaciones</ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>Enviar avisos y alertas a usuarios</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={primaryColor} style={styles.cardArrow} />
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  cardsContainer: {
    marginBottom: 16,
  },
  actionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
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
