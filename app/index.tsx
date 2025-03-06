import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import UserDashboard from '@/components/auth/UserDashboard';
import DriverDashboard from '@/components/auth/DriverDashboard';
import AdminDashboard from '@/components/auth/AdminDashboard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthProvider } from '@/hooks/useAuth';


export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  useEffect(() => {
    // Cuando el usuario esté autenticado, redirigirlo a su respectivo dashboard
    if (user && user.role === 'admin') {
      router.replace('/(admin)/');
    } else if (user && user.role === 'driver') {
      router.replace('/driver');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <LoginScreen />
      </>
    );
  }

  // Mostrar dashboard según el rol del usuario
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'driver') {
    return <DriverDashboard />;
  } else {
    return <UserDashboard />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});