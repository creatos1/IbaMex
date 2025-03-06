import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');

  // Verificar si el usuario tiene permisos de administrador
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      // Redireccionar si no es administrador
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null; // Muestra un spinner o pantalla de carga
  }

  // Solo renderizar el contenido si es administrador
  if (user?.role === 'admin') {
    return (
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor,
          },
          headerTintColor: useThemeColor({ light: '#000', dark: '#fff' }, 'text'),
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Panel de Administración',
            headerLargeTitle: true, 
          }} 
        />
        <Stack.Screen 
          name="users" 
          options={{ 
            title: 'Gestión de Usuarios',
            presentation: 'card',
          }} 
        />
      </Stack>
    );
  }

  return null;
}