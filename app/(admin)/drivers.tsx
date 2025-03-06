
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  assignedRoute: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
}

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { 
      id: 'd1', 
      name: 'Juan Pérez', 
      email: 'jperez@ibamex.com', 
      phone: '555-123-4567', 
      license: 'DL12345', 
      assignedRoute: 'R1-Centro',
      status: 'active',
    },
    { 
      id: 'd2', 
      name: 'Carlos López', 
      email: 'clopez@ibamex.com', 
      phone: '555-234-5678', 
      license: 'DL23456', 
      assignedRoute: 'R2-Norte',
      status: 'active',
    },
    { 
      id: 'd3', 
      name: 'Ana García', 
      email: 'agarcia@ibamex.com', 
      phone: '555-345-6789', 
      license: 'DL34567', 
      assignedRoute: 'R3-Universidad',
      status: 'on_leave',
    },
    { 
      id: 'd4', 
      name: 'Roberto Sánchez', 
      email: 'rsanchez@ibamex.com', 
      phone: '555-456-7890', 
      license: 'DL45678', 
      assignedRoute: null,
      status: 'inactive',
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const cardBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === null || driver.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#F44336';
      case 'on_leave': return '#FFC107';
      default: return '#757575';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'on_leave': return 'En licencia';
      default: return 'Desconocido';
    }
  };
  
  const addNewDriver = () => {
    Alert.alert('Añadir Conductor', 'Funcionalidad en desarrollo');
  };
  
  const editDriver = (id: string) => {
    Alert.alert('Editar Conductor', `Editando conductor con ID: ${id}`);
  };
  
  const viewDriverDetails = (id: string) => {
    Alert.alert('Detalles del Conductor', `Viendo detalles del conductor con ID: ${id}`);
  };
  
  const toggleDriverStatus = (id: string) => {
    setDrivers(drivers.map(driver => {
      if (driver.id === id) {
        let newStatus: 'active' | 'inactive' | 'on_leave';
        switch(driver.status) {
          case 'active': newStatus = 'inactive'; break;
          case 'inactive': newStatus = 'active'; break;
          case 'on_leave': newStatus = 'active'; break;
          default: newStatus = 'active';
        }
        return { ...driver, status: newStatus };
      }
      return driver;
    }));
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar conductores..."
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={addNewDriver}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedStatus === null && { backgroundColor: primaryColor, borderColor: primaryColor }
          ]}
          onPress={() => setSelectedStatus(null)}
        >
          <ThemedText style={[
            styles.filterButtonText,
            selectedStatus === null && { color: 'white' }
          ]}>
            Todos
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedStatus === 'active' && { backgroundColor: primaryColor, borderColor: primaryColor }
          ]}
          onPress={() => setSelectedStatus('active')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            selectedStatus === 'active' && { color: 'white' }
          ]}>
            Activos
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedStatus === 'inactive' && { backgroundColor: primaryColor, borderColor: primaryColor }
          ]}
          onPress={() => setSelectedStatus('inactive')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            selectedStatus === 'inactive' && { color: 'white' }
          ]}>
            Inactivos
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedStatus === 'on_leave' && { backgroundColor: primaryColor, borderColor: primaryColor }
          ]}
          onPress={() => setSelectedStatus('on_leave')}
        >
          <ThemedText style={[
            styles.filterButtonText,
            selectedStatus === 'on_leave' && { color: 'white' }
          ]}>
            En licencia
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.driversList}>
        {filteredDrivers.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <ThemedText style={styles.noResultsText}>No se encontraron conductores</ThemedText>
          </View>
        ) : (
          filteredDrivers.map(driver => (
            <ThemedView key={driver.id} style={[styles.driverCard, { backgroundColor: cardBackground }]}>
              <View style={styles.driverHeader}>
                <View style={styles.driverInfo}>
                  <View style={styles.driverNameContainer}>
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: getStatusColor(driver.status) }
                      ]} 
                    />
                    <ThemedText style={styles.driverName}>{driver.name}</ThemedText>
                  </View>
                  <ThemedText style={styles.driverEmail}>{driver.email}</ThemedText>
                </View>
                
                <View style={styles.avatarContainer}>
                  {driver.avatar ? (
                    <Image source={{ uri: driver.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                      <ThemedText style={styles.avatarInitial}>
                        {driver.name.charAt(0)}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.driverDetails}>
                <View style={styles.driverDetail}>
                  <ThemedText style={styles.driverDetailLabel}>Teléfono:</ThemedText>
                  <ThemedText style={styles.driverDetailValue}>{driver.phone}</ThemedText>
                </View>
                
                <View style={styles.driverDetail}>
                  <ThemedText style={styles.driverDetailLabel}>Licencia:</ThemedText>
                  <ThemedText style={styles.driverDetailValue}>{driver.license}</ThemedText>
                </View>
                
                <View style={styles.driverDetail}>
                  <ThemedText style={styles.driverDetailLabel}>Ruta asignada:</ThemedText>
                  <ThemedText style={styles.driverDetailValue}>
                    {driver.assignedRoute || 'No asignada'}
                  </ThemedText>
                </View>
                
                <View style={styles.driverDetail}>
                  <ThemedText style={styles.driverDetailLabel}>Estado:</ThemedText>
                  <View style={styles.statusBadgeContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(driver.status) }
                      ]}
                    >
                      <ThemedText style={styles.statusBadgeText}>
                        {getStatusText(driver.status)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.driverActions}>
                <TouchableOpacity 
                  style={styles.driverActionButton}
                  onPress={() => viewDriverDetails(driver.id)}
                >
                  <Ionicons name="eye-outline" size={20} color={primaryColor} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.driverActionButton}
                  onPress={() => editDriver(driver.id)}
                >
                  <Ionicons name="create-outline" size={20} color={primaryColor} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.driverActionButton}
                  onPress={() => toggleDriverStatus(driver.id)}
                >
                  <Ionicons 
                    name={
                      driver.status === 'active' ? "pause-circle-outline" : 
                      driver.status === 'inactive' ? "play-circle-outline" : 
                      "reload-outline"
                    } 
                    size={20} 
                    color={
                      driver.status === 'active' ? '#F44336' :
                      driver.status === 'inactive' ? '#4CAF50' :
                      '#FFC107'
                    } 
                  />
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonText: {
    fontSize: 14,
  },
  driversList: {
    flex: 1,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  driverCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  driverDetails: {
    marginTop: 8,
  },
  driverDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  driverDetailLabel: {
    fontWeight: '500',
    marginRight: 4,
  },
  driverDetailValue: {
    opacity: 0.8,
  },
  statusBadgeContainer: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 12,
  },
  driverActionButton: {
    marginLeft: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
