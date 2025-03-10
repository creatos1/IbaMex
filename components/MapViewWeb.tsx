import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

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
  },
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

// Exportar MapViewWeb como un alias de MapView
export const MapViewWeb = MapView;
export const MapMarker = Marker;
export const MapPolyline = Polyline;

// Componente de mapa optimizado con manejo de errores
export const OptimizedMapView = ({ 
  children, 
  initialRegion, 
  style, 
  onMapError,
  onPress,
  ...rest 
}) => {
  const [mapError, setMapError] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    // Timeout to verify map loading
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        setMapError(true);
        if (onMapError) {
          onMapError('Map timeout');
        }
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [mapLoaded, onMapError]);
  
  // Manejar el evento onPress para cuando es web
  const handleMapPress = (e) => {
    if (onPress) {
      // Formatear el evento para que sea similar al de react-native-maps
      const coordinate = {
        latitude: e.nativeEvent.coordinate?.latitude || 19.4326,
        longitude: e.nativeEvent.coordinate?.longitude || -99.1332,
      };
      
      // Si no hay coordinate (como en web), intentar obtener del click
      if (!e.nativeEvent.coordinate && e.nativeEvent.latLng) {
        coordinate.latitude = e.nativeEvent.latLng.lat();
        coordinate.longitude = e.nativeEvent.latLng.lng();
      }
      
      onPress({
        nativeEvent: { coordinate }
      });
    }
  };

  if (mapError) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          No se pudo cargar el mapa. Verifica tu conexión e intenta nuevamente.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion || {
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      style={style}
      onError={(e) => {
        setMapError(true);
        if (onMapError) onMapError(e);
      }}
      onMapReady={() => setMapLoaded(true)}
      onPress={handleMapPress}
      {...rest}
    >
      {children}
    </MapView>
  );
};

// Exportar por defecto para compatibilidad
export default OptimizedMapView;