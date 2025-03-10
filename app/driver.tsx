
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function DriverScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const cardBgColor = useThemeColor({ light: '#f5f5f5', dark: '#2c2c2c' }, 'card');
  
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };
  
  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Panel de Conductor',
          headerShown: true
        }} 
      />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: '#2196F3' }]}>
            <ThemedText style={styles.avatarText}>
              {user?.username?.substring(0, 1).toUpperCase() || 'D'}
            </ThemedText>
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{user?.username || 'Conductor'}</ThemedText>
            <ThemedText style={styles.userRole}>Conductor</ThemedText>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mi ruta actual</ThemedText>
          
          <View style={[styles.card, { backgroundColor: cardBgColor }]}>
            <View style={styles.routeInfo}>
              <ThemedText style={styles.routeName}>Ruta #42 - Centro</ThemedText>
              <ThemedText style={styles.routeDetails}>
                En servicio - Bus #103
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
            >
              <ThemedText style={styles.statusButtonText}>Activo</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: cardBgColor }]}
            onPress={() => Alert.alert('Información', 'Funcionalidad en desarrollo')}
          >
            <Ionicons name="bus" size={24} color={primaryColor} />
            <ThemedText style={styles.menuText}>Iniciar recorrido</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: cardBgColor }]}
            onPress={() => Alert.alert('Información', 'Funcionalidad en desarrollo')}
          >
            <Ionicons name="people" size={24} color={primaryColor} />
            <ThemedText style={styles.menuText}>Pasajeros</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: cardBgColor }]}
            onPress={() => Alert.alert('Información', 'Funcionalidad en desarrollo')}
          >
            <Ionicons name="warning" size={24} color={primaryColor} />
            <ThemedText style={styles.menuText}>Reportar incidente</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: cardBgColor }]}
            onPress={handleProfile}
          >
            <Ionicons name="settings" size={24} color={primaryColor} />
            <ThemedText style={styles.menuText}>Mi perfil</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#f44336' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  routeDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuCard: {
    width: '48%',
    aspectRatio: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 'auto',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
