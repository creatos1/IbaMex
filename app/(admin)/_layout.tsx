import React from 'react';
import { Tabs } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function AdminLayout() {
  const router = useRouter();
  const tintColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const tabIconDefault = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'tabIconDefault');
  
  // Función para cerrar sesión
  const handleLogout = () => {
    router.replace('/');
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: backgroundColor,
        },
        headerStyle: {
          backgroundColor: '#87CEEB',
        },
        headerTintColor: tintColor,
        headerRight: () => (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Gestión de Rutas',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analítica',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#FF5733', // Color contrastante con azul cielo
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Protección de rutas para administradores
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      // Redirigir si no es administrador
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // Si está cargando, no mostrar nada aún
  if (isLoading) {
    return null;
  }

  // Si no hay usuario o no es admin, no renderizar el layout
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0A84FF',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analítica',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
