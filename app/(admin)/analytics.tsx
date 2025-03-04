
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

// Tipos de periodos
type Period = 'today' | 'weekly' | 'monthly';

import PassengerSensorStats from '@/components/PassengerSensorStats';

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  
  // Datos estáticos según el periodo seleccionado
  const getDataForPeriod = (period: Period) => {
    switch (period) {
      case 'today':
        return {
          totalPassengers: 750,
          averageOccupancy: '68%',
          activeRoutes: 8,
          mostUsedRoute: 'Ruta Centro - Norte',
          peakHour: '18:00',
          totalTrips: 42
        };
      case 'weekly':
        return {
          totalPassengers: 5250,
          averageOccupancy: '73%',
          activeRoutes: 12,
          mostUsedRoute: 'Ruta Sur - Norte',
          peakHour: '17:30',
          totalTrips: 312
        };
      case 'monthly':
        return {
          totalPassengers: 22400,
          averageOccupancy: '75%',
          activeRoutes: 12,
          mostUsedRoute: 'Ruta Centro - Oeste',
          peakHour: '18:30',
          totalTrips: 1248
        };
    }
  };
  
  const data = getDataForPeriod(selectedPeriod);
  
  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Analítica de Datos</ThemedText>
      
      <ThemedView style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'today' && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod('today')}
        >
          <ThemedText
            style={[
              styles.periodButtonText,
              selectedPeriod === 'today' && styles.selectedPeriodButtonText
            ]}
          >
            Hoy
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'weekly' && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod('weekly')}
        >
          <ThemedText
            style={[
              styles.periodButtonText,
              selectedPeriod === 'weekly' && styles.selectedPeriodButtonText
            ]}
          >
            Semanal
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'monthly' && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <ThemedText
            style={[
              styles.periodButtonText,
              selectedPeriod === 'monthly' && styles.selectedPeriodButtonText
            ]}
          >
            Mensual
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* Mostrar estadísticas del sensor ESP32 en tiempo real */}
      <PassengerSensorStats />
      
      <ThemedView style={styles.cardsContainer}>
        <ThemedView style={styles.card}>
          <Ionicons name="people-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Total de Pasajeros</ThemedText>
          <ThemedText style={styles.cardValue}>{data.totalPassengers}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="analytics-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Ocupación Promedio</ThemedText>
          <ThemedText style={styles.cardValue}>{data.averageOccupancy}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="git-branch-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Rutas Activas</ThemedText>
          <ThemedText style={styles.cardValue}>{data.activeRoutes}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="star-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Ruta Más Usada</ThemedText>
          <ThemedText style={styles.cardValue}>{data.mostUsedRoute}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="time-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Hora Pico</ThemedText>
          <ThemedText style={styles.cardValue}>{data.peakHour}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <Ionicons name="bus-outline" size={30} color="#0a7ea4" />
          <ThemedText style={styles.cardTitle}>Total de Viajes</ThemedText>
          <ThemedText style={styles.cardValue}>{data.totalTrips}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.graphPlaceholder}>
        <ThemedText style={styles.graphTitle}>Gráfico de Ocupación</ThemedText>
        <ThemedView style={styles.barChart}>
          <ThemedView style={[styles.bar, { height: 100 }]}>
            <ThemedText style={styles.barLabel}>L</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 150 }]}>
            <ThemedText style={styles.barLabel}>M</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 120 }]}>
            <ThemedText style={styles.barLabel}>M</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 180 }]}>
            <ThemedText style={styles.barLabel}>J</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 200 }]}>
            <ThemedText style={styles.barLabel}>V</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 80 }]}>
            <ThemedText style={styles.barLabel}>S</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.bar, { height: 60 }]}>
            <ThemedText style={styles.barLabel}>D</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedPeriodButton: {
    backgroundColor: '#0a7ea4',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
  },
  card: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  graphPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  barChart: {
    height: 220,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  bar: {
    width: 40,
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
  barLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});
