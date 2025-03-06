import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const headerBackground = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const headerTint = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  useEffect(() => {
    // Redirigir si no es administrador
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  // Solo mostrar el layout si es un administrador
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: headerBackground,
        },
        headerTintColor: headerTint,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Administración',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Gestión de Usuarios',
        }}
      />
      <Stack.Screen
        name="routes"
        options={{
          title: 'Gestión de Rutas',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Análisis de Datos',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Configuración',
        }}
      />
      <Stack.Screen
        name="maintenance"
        options={{
          title: 'Mantenimiento',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notificaciones',
        }}
      />
      <Stack.Screen
        name="drivers"
        options={{
          title: 'Gestión de Conductores',
        }}
      />
      <Stack.Screen
        name="incidents"
        options={{
          title: 'Gestión de Incidencias',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});