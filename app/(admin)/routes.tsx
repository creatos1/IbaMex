import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapRoute from './MapRoute';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Definición de tipos
interface Location {
  lat: number;
  lng: number;
}

interface Stop {
  name: string;
  location: Location;
}

interface Route {
  id?: number;
  routeId: string;
  name: string;
  description: string;
  stops: Stop[];
  waypoints: [number, number][];
  active: boolean;
}

// Componente principal
export default function RoutesScreen() {
  const { token, signOut } = useAuth(); // Assuming useAuth now provides signOut
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [newRoute, setNewRoute] = useState<Route>({
    routeId: '',
    name: '',
    description: '',
    stops: [],
    waypoints: [],
    active: true
  });

  // Colores del tema
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const cardColor = useThemeColor({ light: '#f5f5f5', dark: '#1e1e1e' }, 'card');
  const accentColor = useThemeColor({ light: '#0a7ea4', dark: '#64d2ff' }, 'tint');

  // Función para cargar rutas desde el servidor o almacenamiento local
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      // Intentar obtener del almacenamiento local primero
      const storedRoutes = await AsyncStorage.getItem('routes');
      if (storedRoutes) {
        setRoutes(JSON.parse(storedRoutes));
      }

      // Si hay un token, intentar obtener del servidor
      if (token) {
        const API_URL = Platform.OS === 'web'
          ? window.location.origin + '/api'
          : 'http://192.168.100.13:3000/api';

        const response = await fetch(`${API_URL}/routes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRoutes(data);
          // Guardar en almacenamiento local
          await AsyncStorage.setItem('routes', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      Alert.alert('Error', 'No se pudieron cargar las rutas');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cargar rutas al montar el componente
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Función para guardar una ruta (nueva o editada)
  const saveRoute = async (route: Route, isNewRoute = false) => {
    try {
      // Guardar localmente
      let updatedRoutes;
      if (isNewRoute) {
        // Asignar un ID temporal para nuevas rutas
        const tempId = Date.now();
        const newRouteWithId = { ...route, id: tempId };
        updatedRoutes = [...routes, newRouteWithId];
      } else {
        // Actualizar ruta existente
        updatedRoutes = routes.map(r => (r.routeId === route.routeId ? route : r));
      }

      setRoutes(updatedRoutes);
      await AsyncStorage.setItem('routes', JSON.stringify(updatedRoutes));

      // Si hay token, intentar guardar en el servidor
      if (token) {
        const API_URL = Platform.OS === 'web'
          ? window.location.origin + '/api'
          : 'http://192.168.100.13:3000/api';

        const url = isNewRoute
          ? `${API_URL}/routes`
          : `${API_URL}/routes/${route.routeId}`;

        const method = isNewRoute ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(route)
        });

        if (!response.ok) {
          throw new Error('Error al guardar la ruta en el servidor');
        }
      }

      Alert.alert('Éxito', isNewRoute ? 'Ruta creada correctamente' : 'Ruta actualizada correctamente');

      return true;
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Error', 'No se pudo guardar la ruta');
      return false;
    }
  };

  // Función para eliminar una ruta
  const deleteRoute = async (routeId: string) => {
    try {
      // Eliminar localmente
      const updatedRoutes = routes.filter(r => r.routeId !== routeId);
      setRoutes(updatedRoutes);
      await AsyncStorage.setItem('routes', JSON.stringify(updatedRoutes));

      // Si hay token, intentar eliminar en el servidor
      if (token) {
        const API_URL = Platform.OS === 'web'
          ? window.location.origin + '/api'
          : 'http://192.168.100.13:3000/api';

        await fetch(`${API_URL}/routes/${routeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      Alert.alert('Éxito', 'Ruta eliminada correctamente');

      return true;
    } catch (error) {
      console.error('Error deleting route:', error);
      Alert.alert('Error', 'No se pudo eliminar la ruta');
      return false;
    }
  };

  // Manejadores para el formulario de nueva ruta
  const handleAddRoute = () => {
    setNewRoute({
      routeId: '',
      name: '',
      description: '',
      stops: [],
      waypoints: [],
      active: true
    });
    setShowAddForm(true);
    setShowEditForm(false);
    setShowRouteDetails(false);
  };

  const handleSaveNewRoute = async () => {
    if (!newRoute.routeId || !newRoute.name) {
      Alert.alert('Error', 'ID de ruta y nombre son obligatorios');
      return;
    }

    // Verificar si ya existe una ruta con ese ID
    const exists = routes.some(r => r.routeId === newRoute.routeId);
    if (exists) {
      Alert.alert('Error', 'Ya existe una ruta con ese ID');
      return;
    }

    const success = await saveRoute(newRoute, true);
    if (success) {
      setShowAddForm(false);
    }
  };

  // Manejador para editar ruta
  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setNewRoute({ ...route });
    setShowEditForm(true);
    setShowAddForm(false);
    setShowRouteDetails(false);
  };

  const handleSaveEditedRoute = async () => {
    if (!newRoute.name) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    const success = await saveRoute(newRoute, false);
    if (success) {
      setShowEditForm(false);
    }
  };

  // Manejador para ver detalles de ruta
  const handleViewRouteDetails = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  // Manejador para eliminar ruta
  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta ruta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRoute(routeId);
            if (success && showRouteDetails) {
              setShowRouteDetails(false);
            }
          }
        }
      ]
    );
  };

  // Manejador para actualizar waypoints
  const handleRouteCreated = (waypoints: [number, number][]) => {
    setNewRoute(prev => ({ ...prev, waypoints }));
  };

  // Logout function (incorporating the provided change)
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };


  // Renderizar lista de rutas
  const renderRouteList = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accentColor} />
          <ThemedText style={styles.loadingText}>Cargando rutas...</ThemedText>
        </View>
      );
    }

    if (routes.length === 0) {
      return (
        <View style={styles.centered}>
          <ThemedText style={styles.emptyText}>No hay rutas disponibles</ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handleAddRoute}
          >
            <ThemedText style={styles.buttonText}>Agregar Ruta</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Gestión de Rutas</ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: accentColor }]}
            onPress={handleAddRoute}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Nueva Ruta</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.routeList}>
          {routes.map((route, idx) => (
            <TouchableOpacity
              key={`route-${route.routeId}`}
              style={[styles.routeCard, { backgroundColor: cardColor }]}
              onPress={() => handleViewRouteDetails(route)}
            >
              <View style={styles.routeHeader}>
                <ThemedText style={styles.routeName}>{route.name}</ThemedText>
                <ThemedText style={styles.routeId}>ID: {route.routeId}</ThemedText>
              </View>
              <ThemedText style={styles.routeDescription} numberOfLines={2}>
                {route.description || 'Sin descripción'}
              </ThemedText>
              <View style={styles.routeFooter}>
                <ThemedText style={styles.stopsCount}>
                  {route.stops.length} {route.stops.length === 1 ? 'parada' : 'paradas'}
                </ThemedText>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: accentColor }]}
                    onPress={() => handleEditRoute(route)}
                  >
                    <Ionicons name="create-outline" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
                    onPress={() => handleDeleteRoute(route.routeId)}
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    );
  };

  // Renderizar formulario para agregar ruta
  const renderAddForm = () => {
    return (
      <ThemedView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <ThemedText style={styles.formTitle}>Nueva Ruta</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAddForm(false)}
          >
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <ThemedText style={styles.label}>ID de Ruta</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: textColor }]}
            value={newRoute.routeId}
            onChangeText={text => setNewRoute(prev => ({ ...prev, routeId: text }))}
            placeholder="Ej. R001"
            placeholderTextColor="#999"
          />

          <ThemedText style={styles.label}>Nombre</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: textColor }]}
            value={newRoute.name}
            onChangeText={text => setNewRoute(prev => ({ ...prev, name: text }))}
            placeholder="Ej. Ruta Centro"
            placeholderTextColor="#999"
          />

          <ThemedText style={styles.label}>Descripción</ThemedText>
          <TextInput
            style={[styles.textarea, { color: textColor, borderColor: textColor }]}
            value={newRoute.description}
            onChangeText={text => setNewRoute(prev => ({ ...prev, description: text }))}
            placeholder="Descripción de la ruta..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />

          <ThemedText style={styles.label}>Trazar Ruta</ThemedText>
          <View style={styles.mapContainer}>
            <MapRoute
              editable={true}
              onRouteCreated={handleRouteCreated}
            />
          </View>

          <View style={styles.waypointsInfo}>
            <ThemedText style={styles.waypointsCount}>
              {newRoute.waypoints.length} puntos de ruta definidos
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: accentColor }]}
            onPress={handleSaveNewRoute}
          >
            <ThemedText style={styles.buttonText}>Guardar Ruta</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  };

  // Renderizar formulario para editar ruta
  const renderEditForm = () => {
    if (!selectedRoute) return null;

    return (
      <ThemedView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <ThemedText style={styles.formTitle}>Editar Ruta</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowEditForm(false)}
          >
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <ThemedText style={styles.label}>ID de Ruta</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: textColor, backgroundColor: '#e0e0e0' }]}
            value={newRoute.routeId}
            editable={false}
          />

          <ThemedText style={styles.label}>Nombre</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: textColor }]}
            value={newRoute.name}
            onChangeText={text => setNewRoute(prev => ({ ...prev, name: text }))}
          />

          <ThemedText style={styles.label}>Descripción</ThemedText>
          <TextInput
            style={[styles.textarea, { color: textColor, borderColor: textColor }]}
            value={newRoute.description}
            onChangeText={text => setNewRoute(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />

          <ThemedText style={styles.label}>Trazar Ruta</ThemedText>
          <View style={styles.mapContainer}>
            <MapRoute
              editable={true}
              waypoints={newRoute.waypoints}
              onRouteCreated={handleRouteCreated}
            />
          </View>

          <View style={styles.waypointsInfo}>
            <ThemedText style={styles.waypointsCount}>
              {newRoute.waypoints.length} puntos de ruta definidos
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: accentColor }]}
            onPress={handleSaveEditedRoute}
          >
            <ThemedText style={styles.buttonText}>Guardar Cambios</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  };

  // Renderizar detalles de ruta
  const renderRouteDetails = () => {
    if (!selectedRoute) return null;

    return (
      <ThemedView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <ThemedText style={styles.formTitle}>Detalles de Ruta</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowRouteDetails(false)}
          >
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>ID de Ruta:</ThemedText>
            <ThemedText style={styles.detailValue}>{selectedRoute.routeId}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Nombre:</ThemedText>
            <ThemedText style={styles.detailValue}>{selectedRoute.name}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Descripción:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {selectedRoute.description || 'Sin descripción'}
            </ThemedText>
          </View>

          <View style={styles.detailSection}>
            <ThemedText style={styles.sectionTitle}>Mapa de Ruta</ThemedText>
            <View style={styles.mapContainer}>
              <MapRoute
                editable={false}
                waypoints={selectedRoute.waypoints}
              />
            </View>
          </View>

          <View style={styles.detailSection}>
            <ThemedText style={styles.sectionTitle}>Paradas ({selectedRoute.stops.length})</ThemedText>
            {selectedRoute.stops.length > 0 ? (
              selectedRoute.stops.map((stop, index) => (
                <View
                  key={`stop-${stop.name}-${index}`}
                  style={[styles.stopItem, { backgroundColor: cardColor }]}
                >
                  <ThemedText style={styles.stopName}>{stop.name}</ThemedText>
                  <ThemedText style={styles.stopCoords}>
                    {stop.location.lat.toFixed(6)}, {stop.location.lng.toFixed(6)}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={styles.emptyText}>No hay paradas definidas</ThemedText>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButtonLarge, { backgroundColor: accentColor }]}
              onPress={() => handleEditRoute(selectedRoute)}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonLarge, { backgroundColor: '#e74c3c' }]}
              onPress={() => handleDeleteRoute(selectedRoute.routeId)}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  };

  // Renderizar contenido principal
  if (showAddForm) {
    return renderAddForm();
  }

  if (showEditForm) {
    return renderEditForm();
  }

  if (showRouteDetails) {
    return renderRouteDetails();
  }

  return renderRouteList();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  routeList: {
    flex: 1,
  },
  routeCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeId: {
    fontSize: 12,
    opacity: 0.6,
  },
  routeDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopsCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  waypointsInfo: {
    marginBottom: 16,
  },
  waypointsCount: {
    fontStyle: 'italic',
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  detailSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stopItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopCoords: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 30,
  },
});