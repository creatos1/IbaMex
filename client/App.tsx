
import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PassengerCounterScreen from './src/screens/PassengerCounterScreen';
import AuthScreen from './src/screens/AuthScreen';
import useAuth from './src/hooks/useAuth';

export default function App() {
  const { isAuthenticated, user, loading, login, verifyMfa, register, logout } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Una vez que useAuth ha terminado de cargar, actualizar initialLoading
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  // Manejar éxito de autenticación
  const handleAuthSuccess = (token: string, userData: any) => {
    // Nada que hacer aquí, useAuth ya maneja esto
    console.log('Autenticación exitosa');
  };

  // Mostrar pantalla de carga
  if (initialLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0097FB" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {isAuthenticated ? (
        // Usuario autenticado: mostrar la aplicación principal
        <SafeAreaView style={styles.container}>
          <PassengerCounterScreen onLogout={logout} user={user} />
        </SafeAreaView>
      ) : (
        // Usuario no autenticado: mostrar pantalla de autenticación
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
