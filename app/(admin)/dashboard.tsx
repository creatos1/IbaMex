
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.welcomeText}>Bienvenido, Administrador</ThemedText>
      
      <ThemedView style={styles.cardsContainer}>
        <ThemedView style={styles.card}>
          <Ionicons name="git-branch-outline" size={40} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Rutas Activas</ThemedText>
          <ThemedText style={styles.cardValue}>12</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="bus-outline" size={40} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Unidades</ThemedText>
          <ThemedText style={styles.cardValue}>25</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="people-outline" size={40} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Ocupación promedio</ThemedText>
          <ThemedText style={styles.cardValue}>75%</ThemedText>
        </ThemedView>
      </ThemedView>
      
      {/* Eliminamos el botón de cerrar sesión de aquí ya que lo moveremos a la cabecera */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: '30%',
    minWidth: 110,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10, // Reducido de 20 a 10
    marginHorizontal: 4, // Añadido para acercarlas horizontalmente
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    padding: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
