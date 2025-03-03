
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Platform, Alert, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

// Platform-specific imports for MapView
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS === 'web') {
  // Use our web mock implementation
  const WebMaps = require('@/components/MapViewWeb');
  MapView = WebMaps.MapView;
  Marker = WebMaps.Marker;
  Polyline = WebMaps.Polyline;
} else {
  // Use native implementation
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

// Tipos para las rutas
type Stop = {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
};

type RoutePoint = {
  id: string;
  latitude: number;
  longitude: number;
};

type Route = {
  id: string;
  name: string;
  description: string;
  points: RoutePoint[];
  stops: Stop[];
  color?: string;
  isActive?: boolean;
};

// Región inicial (Ciudad de México)
const initialRegion = {
  latitude: 19.432608,
  longitude: -99.133209,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Colores para las rutas
const routeColors = [
  '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
  '#33FFF0', '#F0FF33', '#8033FF', '#FF8033', '#33FF80'
];

export default function RoutesScreen() {
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopName, setStopName] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [addingStopLocation, setAddingStopLocation] = useState(false);
  const [currentStopToAdd, setCurrentStopToAdd] = useState<Stop | null>(null);
  const [mapMode, setMapMode] = useState<'route' | 'stop'>('route');
  
  const mapRef = useRef<any>(null);
  
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const cardBackground = useThemeColor({ light: '#f8f9fa', dark: '#2a2a2a' }, 'background');

  // Cargar rutas guardadas al iniciar
  useEffect(() => {
    // Aquí podrías cargar las rutas desde un almacenamiento local o API
    // Por ahora usamos un ejemplo
    const savedRoutes = localStorage.getItem('routes');
    if (savedRoutes) {
      try {
        setRoutes(JSON.parse(savedRoutes));
      } catch (error) {
        console.error('Error parsing saved routes:', error);
      }
    }
  }, []);

  // Guardar rutas cuando cambien
  useEffect(() => {
    if (routes.length > 0) {
      localStorage.setItem('routes', JSON.stringify(routes));
    }
  }, [routes]);

  // Función para añadir un punto en el mapa
  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    if (mapMode === 'route') {
      setRoutePoints([...routePoints, {
        id: Date.now().toString(),
        latitude,
        longitude
      }]);
    } else if (mapMode === 'stop' && currentStopToAdd) {
      const updatedStop = {
        ...currentStopToAdd,
        latitude,
        longitude
      };
      
      setStops(stops.map(stop => 
        stop.id === currentStopToAdd.id ? updatedStop : stop
      ));
      
      setAddingStopLocation(false);
      setCurrentStopToAdd(null);
      setMapMode('route');
    }
  };

  // Función para añadir una parada
  const addStop = () => {
    if (stopName.trim()) {
      const newStop = { 
        id: Date.now().toString(), 
        name: stopName 
      };
      setStops([...stops, newStop]);
      setStopName('');
    }
  };
  
  // Función para asignar ubicación a una parada
  const assignStopLocation = (stop: Stop) => {
    setCurrentStopToAdd(stop);
    setAddingStopLocation(true);
    setMapMode('stop');
    
    // Mostrar instrucciones al usuario
    Alert.alert(
      "Asignar ubicación",
      "Toca en el mapa para asignar la ubicación de esta parada",
      [{ text: "OK" }]
    );
  };

  // Función para eliminar un punto de la ruta
  const removeRoutePoint = (pointId: string) => {
    setRoutePoints(routePoints.filter(point => point.id !== pointId));
  };
  
  // Función para eliminar una parada
  const removeStop = (stopId: string) => {
    setStops(stops.filter(stop => stop.id !== stopId));
  };

  // Función para crear una ruta
  const createRoute = () => {
    if (routeName && routeDescription && routePoints.length > 0) {
      const newRoute = {
        id: Date.now().toString(),
        name: routeName,
        description: routeDescription,
        points: routePoints,
        stops: stops,
        color: routeColors[routes.length % routeColors.length],
        isActive: true
      };

      setRoutes([...routes, newRoute]);

      // Resetear formulario
      setRouteName('');
      setRouteDescription('');
      setRoutePoints([]);
      setStops([]);
    }
  };

  // Función para ver el mapa de una ruta
  const viewRouteMap = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteMap(true);
  };
  
  // Función para alternar la activación de una ruta
  const toggleRouteActive = (routeId: string) => {
    setRoutes(routes.map(route => 
      route.id === routeId 
        ? { ...route, isActive: !route.isActive } 
        : route
    ));
  };
  
  // Función para eliminar una ruta
  const deleteRoute = (routeId: string) => {
    Alert.alert(
      "Eliminar Ruta",
      "¿Estás seguro de que deseas eliminar esta ruta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            setRoutes(routes.filter(route => route.id !== routeId));
          }
        }
      ]
    );
  };

  // Calcular distancia total (simplificada)
  const calculateDistance = (points: RoutePoint[]) => {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Fórmula de Haversine simplificada
      const R = 6371; // Radio de la Tierra en km
      const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
      const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;

      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos((p1.latitude * Math.PI) / 180) * 
        Math.cos((p2.latitude * Math.PI) / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      total += distance;
    }
    return total.toFixed(2);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Gestión de Rutas</ThemedText>

      <ThemedText style={styles.label}>Nombre de la Ruta</ThemedText>
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
        value={routeName}
        onChangeText={setRouteName}
        placeholder="Nombre de la ruta"
        placeholderTextColor="#888"
      />

      <ThemedText style={styles.label}>Descripción</ThemedText>
      <TextInput
        style={[styles.textArea, { backgroundColor: inputBackground, color: textColor }]}
        value={routeDescription}
        onChangeText={setRouteDescription}
        placeholder="Descripción de la ruta"
        placeholderTextColor="#888"
        multiline
      />

      <ThemedText style={styles.label}>Mapa de la Ruta</ThemedText>
      <ThemedText style={styles.helpText}>
        {mapMode === 'route' 
          ? 'Toca en el mapa para añadir puntos a la ruta'
          : 'Toca en el mapa para asignar la ubicación de la parada'}
      </ThemedText>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude
            }}
            title={`Punto ${index + 1}`}
          />
        ))}
        
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude
            }))}
            strokeColor="#0a7ea4"
            strokeWidth={3}
          />
        )}
        
        {/* Mostrar los markers de las paradas con ubicación */}
        {stops.filter(stop => stop.latitude && stop.longitude).map((stop, index) => (
          <Marker
            key={`stop-${stop.id}`}
            coordinate={{
              latitude: stop.latitude as number,
              longitude: stop.longitude as number
            }}
            title={stop.name}
            pinColor="green"
          />
        ))}
      </MapView>
      
      {routePoints.length > 0 && (
        <ThemedView style={styles.pointsList}>
          <ThemedText style={styles.pointsListTitle}>Puntos de la Ruta:</ThemedText>
          {routePoints.map((point, index) => (
            <ThemedView key={point.id} style={styles.pointItem}>
              <ThemedText>Punto {index + 1}: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}</ThemedText>
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => removeRoutePoint(point.id)}
              >
                <ThemedText style={styles.removeButtonText}>×</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <ThemedText style={styles.label}>Paradas</ThemedText>
      <ThemedView style={styles.stopsContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }, { backgroundColor: inputBackground, color: textColor }]}
          value={stopName}
          onChangeText={setStopName}
          placeholder="Nombre de la parada"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.addButton} onPress={addStop} disabled={!stopName.trim()}>
          <ThemedText style={styles.addButtonText}>+</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {stops.length > 0 && (
        <ThemedView style={styles.stopsList}>
          {stops.map((stop) => (
            <ThemedView key={stop.id} style={styles.stopItem}>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText>{stop.name}</ThemedText>
                <ThemedView style={{ flexDirection: 'row' }}>
                  {!stop.latitude && (
                    <TouchableOpacity
                      style={[styles.stopButton, styles.locationButton]}
                      onPress={() => assignStopLocation(stop)}
                    >
                      <Ionicons name="location" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.stopButton, styles.removeStopButton]}
                    onPress={() => removeStop(stop.id)}
                  >
                    <ThemedText style={styles.stopButtonText}>×</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
              {stop.latitude && stop.longitude && (
                <ThemedText style={styles.stopCoordinates}>
                  Ubicación: {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                </ThemedText>
              )}
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <TouchableOpacity 
        style={[styles.createButton, (!routeName || !routeDescription || routePoints.length === 0) ? styles.disabledButton : {}]}
        onPress={createRoute}
        disabled={!routeName || !routeDescription || routePoints.length === 0}
      >
        <ThemedText style={styles.createButtonText}>Crear Ruta</ThemedText>
      </TouchableOpacity>

      {routes.length > 0 && (
        <>
          <ThemedText style={[styles.title, { marginTop: 40 }]}>Rutas Existentes</ThemedText>
          {routes.map((route) => (
            <ThemedView key={route.id} style={[styles.routeCard, { backgroundColor: cardBackground }]}>
              <ThemedView style={styles.routeCardHeader}>
                <ThemedText style={styles.routeCardTitle}>{route.name}</ThemedText>
                <ThemedView style={styles.routeCardActions}>
                  <TouchableOpacity 
                    style={[styles.iconButton, route.isActive ? styles.activeRouteButton : styles.inactiveRouteButton]} 
                    onPress={() => toggleRouteActive(route.id)}
                  >
                    <Ionicons name={route.isActive ? "eye" : "eye-off"} size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.iconButton, styles.deleteRouteButton]} 
                    onPress={() => deleteRoute(route.id)}
                  >
                    <Ionicons name="trash" size={18} color="white" />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
              
              <ThemedText style={styles.routeCardDescription}>{route.description}</ThemedText>
              
              <ThemedView style={styles.routeCardFooter}>
                <TouchableOpacity style={styles.viewMapButton} onPress={() => viewRouteMap(route)}>
                  <ThemedText style={styles.viewMapButtonText}>Ver en Mapa</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.distanceText}>
                  Distancia: {calculateDistance(route.points)} km
                </ThemedText>
              </ThemedView>

              {route.stops.length > 0 && (
                <ThemedView style={styles.routeStops}>
                  <ThemedText style={styles.routeStopsTitle}>Paradas:</ThemedText>
                  {route.stops.map((stop, index) => (
                    <ThemedText key={stop.id} style={styles.routeStopItem}>
                      {index + 1}. {stop.name}
                      {stop.latitude && stop.longitude && ` (${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)})`}
                    </ThemedText>
                  ))}
                </ThemedView>
              )}
            </ThemedView>
          ))}
        </>
      )}

      {/* Modal para mostrar el mapa de una ruta */}
      {Platform.OS !== 'web' && showRouteMap && selectedRoute && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRouteMap}
          onRequestClose={() => setShowRouteMap(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <ThemedView style={[styles.modalContent, { backgroundColor: cardBackground }]}>
              <ThemedText style={styles.modalTitle}>{selectedRoute.name}</ThemedText>
              
              <MapView
                style={styles.modalMap}
                initialRegion={selectedRoute.points.length > 0 ? {
                  latitude: selectedRoute.points[0].latitude,
                  longitude: selectedRoute.points[0].longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                } : initialRegion}
              >
                {selectedRoute.points.map((point, index) => (
                  <Marker
                    key={`route-point-${point.id}`}
                    coordinate={{
                      latitude: point.latitude,
                      longitude: point.longitude
                    }}
                    title={`Punto ${index + 1}`}
                  />
                ))}
                
                {selectedRoute.points.length > 1 && (
                  <Polyline
                    coordinates={selectedRoute.points.map(point => ({
                      latitude: point.latitude,
                      longitude: point.longitude
                    }))}
                    strokeColor={selectedRoute.color || "#0a7ea4"}
                    strokeWidth={3}
                  />
                )}
                
                {selectedRoute.stops
                  .filter(stop => stop.latitude && stop.longitude)
                  .map((stop) => (
                    <Marker
                      key={`route-stop-${stop.id}`}
                      coordinate={{
                        latitude: stop.latitude as number,
                        longitude: stop.longitude as number
                      }}
                      title={stop.name}
                      pinColor="green"
                    />
                ))}
              </MapView>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRouteMap(false)}
              >
                <ThemedText style={styles.closeButtonText}>Cerrar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  textArea: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  pointsList: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pointsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 5,
  },
  stopsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopsList: {
    marginBottom: 20,
  },
  stopItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  stopCoordinates: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  stopButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  locationButton: {
    backgroundColor: '#0a7ea4',
  },
  removeStopButton: {
    backgroundColor: '#ff6b6b',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeCardActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  activeRouteButton: {
    backgroundColor: '#28a745',
  },
  inactiveRouteButton: {
    backgroundColor: '#6c757d',
  },
  deleteRouteButton: {
    backgroundColor: '#dc3545',
  },
  routeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeCardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  routeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewMapButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
    padding: 8,
  },
  viewMapButtonText: {
    color: 'white',
    fontSize: 14,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeStops: {
    marginTop: 10,
  },
  routeStopsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  routeStopItem: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMap: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});
