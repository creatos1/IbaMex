
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock MapView component for web
export const MapView = ({ style, children, onPress, initialRegion, ...props }: any) => {
  const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#1a1a1a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  
  // Añadir simulación de click para desarrollo web
  const handleMapClick = (e: React.MouseEvent) => {
    if (onPress && typeof onPress === 'function') {
      // Simulamos las coordenadas en un punto fijo para desarrollo
      const mockEvent = {
        nativeEvent: {
          coordinate: {
            latitude: 19.432608 + (Math.random() * 0.01 - 0.005),
            longitude: -99.133209 + (Math.random() * 0.01 - 0.005)
          }
        }
      };
      onPress(mockEvent);
    }
  };
  
  return (
    <View style={[styles.mapContainer, { backgroundColor }, style]} onClick={handleMapClick}>
      <Text style={[styles.mapText, { color: textColor }]}>
        Mapa no disponible en la web
      </Text>
      <Text style={[styles.mapSubText, { color: textColor }]}>
        (Haz clic para simular añadir puntos)
      </Text>
      
      {/* Mostrar los marcadores como una lista en web para desarrollo */}
      <View style={styles.markersContainer}>
        {children}
      </View>
    </View>
  );
};

// Mock Marker component for web
export const Marker = ({ coordinate, title, description, ...props }: any) => {
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  
  if (!coordinate) return null;
  
  return (
    <View style={styles.markerItem}>
      <Text style={[styles.markerTitle, { color: textColor }]}>
        {title || 'Punto'}: {coordinate.latitude.toFixed(6)}, {coordinate.longitude.toFixed(6)}
      </Text>
      {description && (
        <Text style={[styles.markerDescription, { color: textColor }]}>{description}</Text>
      )}
    </View>
  );
};

// Mock other required components/functions
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export const Callout = () => null;
export const Circle = () => null;
export const Heatmap = () => null;
export const Polyline = ({ coordinates, ...props }: any) => {
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  
  if (!coordinates || coordinates.length === 0) return null;
  
  return (
    <View style={styles.polylineContainer}>
      <Text style={[styles.polylineText, { color: textColor }]}>
        Ruta con {coordinates.length} puntos
      </Text>
    </View>
  );
};
export const Polygon = () => null;

// Mock region type and functions
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const animateToRegion = () => {};
export const fitToCoordinates = () => {};

const styles = StyleSheet.create({
  mapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    minHeight: 200,
    zIndex: 1,
    overflow: 'hidden',
  },
  mapText: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapSubText: {
    fontSize: 14,
    marginBottom: 15,
  },
  markersContainer: {
    width: '90%',
    maxHeight: 150,
    overflow: 'scroll',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  markerItem: {
    marginBottom: 5,
    paddingVertical: 5,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  markerDescription: {
    fontSize: 12,
  },
  polylineContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 5,
  },
  polylineText: {
    fontSize: 12,
  }
});

// Export a default for compatibility with import statements
export default MapView;
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

// This is a web-compatible fallback for react-native-maps
// It simply displays a message that maps are not available on web
const MapViewWeb = (props: any) => {
  return (
    <View style={[styles.container, props.style]}>
      <ThemedText style={styles.text}>
        Map view is not available in web mode.
        Please use a mobile device or emulator to view maps.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    textAlign: 'center',
    padding: 20,
  }
});

// Create a MapMarker component to prevent errors
const MapMarker = () => null;

export { MapViewWeb, MapMarker };
export default MapViewWeb;
