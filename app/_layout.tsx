
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

// Component para manejar la redirección basada en el estado de autenticación
function AuthRedirect() {
  const { user, isLoading, requireMfa } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // No redireccionar mientras está cargando
    if (isLoading) return;

    // Obtener el primer segmento para determinar la ruta actual
    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    // Verificar si necesita MFA
    if (requireMfa) {
      // Redirigir a la verificación MFA, a menos que ya esté ahí
      if (segments[0] !== 'mfa-verification') {
        router.replace('/mfa-verification');
      }
      return;
    }

    // Si está autenticado, redirigir a la pantalla principal según el rol
    if (user) {
      // Si ya está en una ruta de aplicación, no redireccionar
      if (inTabsGroup || (user.role === 'admin' && inAdminGroup) || 
          (user.role === 'driver' && segments[0] === 'driver')) {
        return;
      }

      // Redirigir según el rol
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'driver') {
        router.replace('/driver');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      // Si no está autenticado y no está en una ruta de autenticación, redirigir a login
      if (segments[0] !== 'login' && segments[0] !== 'register' && 
          segments[0] !== 'mfa-verification') {
        router.replace('/login');
      }
    }
  }, [user, isLoading, requireMfa, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthRedirect />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
