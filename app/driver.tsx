
import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import DriverDashboard from '@/components/auth/DriverDashboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function DriverScreen() {
  const { user, isLoading } = useAuth();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>No has iniciado sesión</ThemedText>
      </ThemedView>
    );
  }

  if (user.role !== 'driver') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>No tienes permisos para acceder a esta página</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DriverDashboard />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});
