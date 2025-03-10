import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDescription, setNewRouteDescription] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCoordinate = (coordinate) => {
    setRouteCoordinates([...routeCoordinates, coordinate]);
  };

  const addStop = (stopName) => {
    setRouteStops([...routeStops, stopName]);
  };

  const saveRoute = async () => {
    if (!newRouteName || !newRouteDescription || routeCoordinates.length === 0) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const newRoute = {
      name: newRouteName,
      description: newRouteDescription,
      coordinates: routeCoordinates,
      stops: routeStops,
    };

    try {
      // Simulate saving to database (replace with actual database interaction)
      const updatedRoutes = [...routes, newRoute];
      setRoutes(updatedRoutes);

      if (Platform.OS !== 'web') {
          await AsyncStorage.setItem('routes', JSON.stringify(updatedRoutes));
      }

      setNewRouteName('');
      setNewRouteDescription('');
      setRouteCoordinates([]);
      setRouteStops([]);
      Alert.alert('Success', 'Ruta guardada correctamente.');
    } catch (error) {
      Alert.alert('Error', 'Error al guardar la ruta.');
      console.error('Error saving route:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      // Primero intentar cargar desde localStorage
      let localRoutes = null;

      try {
        if (Platform.OS !== 'web') {
          const savedRoutes = await AsyncStorage.getItem('routes');
          if (savedRoutes) {
            localRoutes = JSON.parse(savedRoutes);
            setRoutes(localRoutes);
          }
        }
      } catch (storageError) {
        console.log('No se pudieron cargar rutas desde localStorage', storageError);
      }

      // Luego intentar desde la API
      const response = await fetch('/api/routes');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);

        // Guardar en localStorage para acceso offline
        if (Platform.OS !== 'web') {
          await AsyncStorage.setItem('routes', JSON.stringify(data));
        }
      } else {
        // Si falla pero tenemos datos locales, no mostrar error
        if (!localRoutes) {
          setError('No se pudieron cargar las rutas del servidor');
        }
      }
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      setError('Error de conexión al cargar rutas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();

    const loadFromLocalStorage = async () => {
      try {
        const savedRoutes = await AsyncStorage.getItem('routes');
        if (savedRoutes && (!routes || routes.length === 0)) {
          setRoutes(JSON.parse(savedRoutes));
        }
      } catch (error) {
        console.log('No se pudieron cargar rutas desde localStorage');
      }
    };

    loadFromLocalStorage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Rutas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la ruta"
        value={newRouteName}
        onChangeText={setNewRouteName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción de la ruta"
        value={newRouteDescription}
        onChangeText={setNewRouteDescription}
        multiline={true}
        numberOfLines={4}
      />

      {/* Simplified route drawing - replace with actual map component */}
      <Text>Coordenadas: {routeCoordinates.join(', ')}</Text>
      <Button title="Agregar Coordenada (Simulado)" onPress={() => addCoordinate([Math.random()*100, Math.random()*100])} />

      <TextInput
        style={styles.input}
        placeholder="Nombre de parada"
        onChangeText={addStop}
      />
      <Text>Paradas: {routeStops.join(', ')}</Text>

      <Button title="Guardar Ruta" onPress={saveRoute} />
      {loading && <Text>Cargando...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <FlatList
        data={routes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Coordenadas: {item.coordinates.join(', ')}</Text>
            <Text>Paradas: {item.stops.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default RouteManager;