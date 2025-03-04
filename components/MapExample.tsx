
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapView, Marker } from './MapView'; // Use our platform-compatible component

const MapExample = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: 19.4326,
            longitude: -99.1332,
          }}
          title="Ciudad de México"
          description="Capital de México"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapExample;
