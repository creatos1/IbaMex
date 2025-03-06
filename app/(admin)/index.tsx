
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  
  const iconColor = useThemeColor({ light: '#333', dark: '#fff' }, 'text');
  const cardBackground = useThemeColor({ light: '#f5f5f5', dark: '#292929' }, 'card');
  
  const navigateToUsers = () => {
    router.push('/users');
  };
  
  if (!user || user.role !== 'admin') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          No tienes permisos para acceder a esta sección
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.welcomeText}>
          Bienvenido, {user.username}
        </ThemedText>
        <ThemedText style={styles.roleText}>
          Rol: Administrador
        </ThemedText>
      </ThemedView>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: cardBackground }]}
          onPress={() => router.push('/users')}
        >
          <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
            <FontAwesome name="users" size={24} color="#fff" />
          </View>
          <ThemedText style={styles.cardTitle}>Gestión de Usuarios</ThemedText>
          <ThemedText style={styles.cardDescription}>
            Administra usuarios, cambia roles y estados
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: cardBackground }]}
          onPress={() => router.push('/')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
            <FontAwesome name="dashboard" size={24} color="#fff" />
          </View>
          <ThemedText style={styles.cardTitle}>Panel Principal</ThemedText>
          <ThemedText style={styles.cardDescription}>
            Volver al panel principal de la aplicación
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.statsTitle}>Estadísticas del Sistema</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>--</ThemedText>
            <ThemedText style={styles.statLabel}>Usuarios</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>--</ThemedText>
            <ThemedText style={styles.statLabel}>Conductores</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>--</ThemedText>
            <ThemedText style={styles.statLabel}>Nuevos hoy</ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    opacity: 0.7,
  },
  cardsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    padding: 20,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
