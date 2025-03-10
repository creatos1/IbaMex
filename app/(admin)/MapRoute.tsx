import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

// Componente específico para web
const MapView = Platform.select({
  web: () => require('../../components/MapViewWeb').default,
  default: () => require('../../components/MapView').default,
})();

const MapRoute = ({ route, onSaveWaypoints, isEditing = false, initialMarkers = [] }) => {
  const [markers, setMarkers] = useState(initialMarkers || []);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const primaryColor = useThemeColor({ light: '#007BFF', dark: '#0A84FF' }, 'tint');
  const secondaryColor = useThemeColor({ light: '#FF3B30', dark: '#FF453A' }, 'text');
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#1C1C1E' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'border');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  // Referencia para evitar múltiples actualizaciones
  const markersRef = useRef(markers);

  // Actualizar la referencia cuando markers cambia
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  // Manejar clic en el mapa (solo cuando está en modo edición)
  const handleMapPress = (event) => {
    if (!isEditing) return;

    // Extraer coordenadas según la plataforma
    let newCoords;
    if (Platform.OS === 'web') {
      newCoords = [event.latlng.lat, event.latlng.lng];
    } else {
      newCoords = [event.nativeEvent.coordinate.latitude, event.nativeEvent.coordinate.longitude];
    }

    // Usar la función de actualización de estado para prevenir problemas con closures
    setMarkers(currentMarkers => [...currentMarkers, newCoords]);
  };

  // Eliminar un marcador
  const removeMarker = (index) => {
    setMarkers(currentMarkers => currentMarkers.filter((_, i) => i !== index));
  };

  // Limpiar todos los marcadores
  const clearMarkers = () => {
    setMarkers([]);
  };

  // Guardar cambios
  const saveChanges = () => {
    if (markers.length < 2) {
      Alert.alert('Error', 'Se necesitan al menos dos puntos para crear una ruta');
      return;
    }

    setLoading(true);

    // Llamar a la función de guardado proporcionada por el componente padre
    if (onSaveWaypoints) {
      onSaveWaypoints(markers);
    }

    setLoading(false);
  };

  // Manejar el evento de que el mapa esté listo
  const handleMapReady = () => {
    setMapReady(true);
  };

  return (
    <ThemedView style={styles.container}>
      {!mapReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Cargando mapa...</ThemedText>
        </View>
      )}

      {/* Usar el componente MapView importado dinámicamente */}
      {MapView && (
        <>
          <MapView
            style={[styles.map, !mapReady && { display: 'none' }]}
            markers={markers}
            onPress={handleMapPress}
            onMapReady={handleMapReady}
            editable={isEditing}
          />

          {mapReady && (
            <View style={styles.controls}>
              {isEditing && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: secondaryColor }]}
                    onPress={clearMarkers}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.buttonText}>Limpiar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor }]}
                    onPress={saveChanges}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="save-outline" size={20} color="white" />
                    )}
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.helpText}>
                <ThemedText style={styles.helpTextContent}>
                  {isEditing 
                    ? 'Toca el mapa para añadir puntos a la ruta' 
                    : `${markers.length} puntos en la ruta`}
                </ThemedText>
              </View>
            </View>
          )}
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  helpText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpTextContent: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default MapRoute;