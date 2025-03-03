
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DriverScreen() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.greeting}>Hola, conductor</ThemedText>
      <ThemedText style={styles.message}>
        Bienvenido a la aplicación de IbaMex. Esta es tu pantalla principal.
      </ThemedText>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <ThemedText style={styles.buttonText}>Cerrar Sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    maxWidth: 200,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
