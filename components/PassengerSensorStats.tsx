
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, Alert } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importamos el cliente MQTT para React Native
let MQTT: any = null;

// Configuración MQTT - Broker de HiveMQ público
const MQTT_BROKER_URL = "broker.hivemq.com";
const MQTT_PORT = 8000; // Puerto para WebSockets
const MQTT_CLIENT_ID = `ibamex_app_${Math.random().toString(16).substring(2, 10)}`;
const MQTT_TOPICS = {
  PASSENGER_COUNT: "ibamex/bus/passenger/count",
  STATUS: "ibamex/bus/status",
};

interface SensorData {
  lastReading: Date;
  totalDetections: number;
  busId: string;
  routeId: string;
  batteryLevel?: number;
  isOnline: boolean;
}

// Initial data
const initialData: SensorData = {
  lastReading: new Date(),
  totalDetections: 0,
  busId: "No conectado",
  routeId: "No conectado",
  batteryLevel: 100,
  isOnline: false,
};

export default function PassengerSensorStats() {
  const [sensorData, setSensorData] = useState<SensorData>(initialData);
  const [connected, setConnected] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [client, setClient] = useState<any>(null);
  const accentColor = useThemeColor(
    { light: "#0a7ea4", dark: "#2f95dc" },
    "tint",
  );

  // Inicializar cliente MQTT
  useEffect(() => {
    let mqttClient: any = null;
    let intervalId: NodeJS.Timeout | null = null;

    const setupMqtt = async () => {
      try {
        console.log("Inicializando cliente MQTT para native");
        
        if (Platform.OS !== 'web') {
          // Utilizamos @meshtastic/react-native-mqtt para entornos móviles
          try {
            MQTT = await import('@meshtastic/react-native-mqtt');
            
            // Configurar el cliente con el broker
            const clientId = MQTT_CLIENT_ID;
            console.log('Connecting to', `ws://${MQTT_BROKER_URL}:${MQTT_PORT}/mqtt`);
            
            mqttClient = MQTT.connect(`ws://${MQTT_BROKER_URL}:${MQTT_PORT}/mqtt`, {
              clientId: clientId,
              keepalive: 60,
              clean: true,
              reconnectPeriod: 1000,
            });
            
            mqttClient.on('connect', () => {
              console.log('Conectado al broker MQTT');
              setConnected(true);
              setSimulationMode(false);
              
              // Suscribirse a los temas
              mqttClient.subscribe(MQTT_TOPICS.PASSENGER_COUNT);
              mqttClient.subscribe(MQTT_TOPICS.STATUS);
            });
            
            mqttClient.on('error', (err: any) => {
              console.error('Error de conexión MQTT:', err);
              setupSimulation();
            });
            
            mqttClient.on('message', (topic: string, message: any) => {
              try {
                // Convertir el mensaje a string y luego parsear como JSON
                const messageStr = message.toString();
                const parsedMessage = JSON.parse(messageStr);
                
                console.log('Mensaje recibido:', topic, parsedMessage);
                
                // Procesar según el tema
                if (topic === MQTT_TOPICS.PASSENGER_COUNT) {
                  setSensorData((prev) => ({
                    ...prev,
                    lastReading: new Date(),
                    totalDetections: prev.totalDetections + (parsedMessage.count || 0),
                    busId: parsedMessage.busId || prev.busId,
                    routeId: parsedMessage.routeId || prev.routeId,
                    isOnline: true,
                  }));
                } else if (topic === MQTT_TOPICS.STATUS) {
                  setSensorData((prev) => ({
                    ...prev,
                    lastReading: new Date(),
                    busId: parsedMessage.busId || prev.busId,
                    routeId: parsedMessage.routeId || prev.routeId,
                    batteryLevel:
                      parsedMessage.batteryLevel !== undefined
                        ? parsedMessage.batteryLevel
                        : prev.batteryLevel,
                    isOnline: parsedMessage.status === "active",
                  }));
                }
              } catch (error) {
                console.error('Error procesando mensaje MQTT:', error);
              }
            });
            
            setClient(mqttClient);
            return mqttClient;
          } catch (error) {
            console.error('Error al cargar biblioteca MQTT:', error);
            throw error;
          }
        } else {
          // Para entornos web intentamos usar una solución compatible
          try {
            const webMQTT = await import('mqtt/dist/mqtt.min');
            
            mqttClient = webMQTT.connect(`ws://${MQTT_BROKER_URL}:${MQTT_PORT}/mqtt`, {
              clientId: MQTT_CLIENT_ID,
            });
            
            mqttClient.on('connect', () => {
              console.log('Conectado al broker MQTT (Web)');
              setConnected(true);
              setSimulationMode(false);
              
              // Suscribirse a los temas
              mqttClient.subscribe(MQTT_TOPICS.PASSENGER_COUNT);
              mqttClient.subscribe(MQTT_TOPICS.STATUS);
            });
            
            mqttClient.on('error', (err: any) => {
              console.error('Error de conexión MQTT (Web):', err);
              setupSimulation();
            });
            
            mqttClient.on('message', (topic: string, message: any) => {
              try {
                // Convertir el mensaje a string y luego parsear como JSON
                const messageStr = message.toString();
                const parsedMessage = JSON.parse(messageStr);
                
                console.log('Mensaje recibido:', topic, parsedMessage);
                
                // Procesar según el tema
                if (topic === MQTT_TOPICS.PASSENGER_COUNT) {
                  setSensorData((prev) => ({
                    ...prev,
                    lastReading: new Date(),
                    totalDetections: prev.totalDetections + (parsedMessage.count || 0),
                    busId: parsedMessage.busId || prev.busId,
                    routeId: parsedMessage.routeId || prev.routeId,
                    isOnline: true,
                  }));
                } else if (topic === MQTT_TOPICS.STATUS) {
                  setSensorData((prev) => ({
                    ...prev,
                    lastReading: new Date(),
                    busId: parsedMessage.busId || prev.busId,
                    routeId: parsedMessage.routeId || prev.routeId,
                    batteryLevel:
                      parsedMessage.batteryLevel !== undefined
                        ? parsedMessage.batteryLevel
                        : prev.batteryLevel,
                    isOnline: parsedMessage.status === "active",
                  }));
                }
              } catch (error) {
                console.error('Error procesando mensaje MQTT:', error);
              }
            });
            
            setClient(mqttClient);
            return mqttClient;
          } catch (error) {
            console.error('Error al cargar biblioteca MQTT para web:', error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Error al inicializar MQTT:", error);
        setupSimulation();
        return null;
      }
    };

    const setupSimulation = () => {
      console.log("Configurando modo simulación");
      setSimulationMode(true);
      setConnected(false);
      
      const UPDATE_INTERVAL = 5000; // milliseconds

      const simulateRealTimeData = () => {
        // Simular un incremento aleatorio (0-5 pasajeros)
        const newPassengers = Math.floor(Math.random() * 6);

        // Simular una disminución aleatoria de batería (0-2%)
        const batteryDecrease = Math.random() * 2;

        // IDs de bus aleatorios (para simulación)
        const busIds = ["BUS101", "BUS102", "BUS103", "BUS104"];
        const routeIds = [
          "R1-Centro",
          "R2-Norte",
          "R3-Universidad",
          "R4-Aeropuerto",
        ];

        setSensorData((prev) => ({
          lastReading: new Date(),
          totalDetections: prev.totalDetections + newPassengers,
          busId: busIds[Math.floor(Math.random() * busIds.length)],
          routeId: routeIds[Math.floor(Math.random() * routeIds.length)],
          batteryLevel: Math.max(0, (prev.batteryLevel ?? 100) - batteryDecrease),
          isOnline: Math.random() > 0.1, // 90% de probabilidad de estar en línea
        }));
      };

      // Actualización inicial
      simulateRealTimeData();

      // Configurar intervalo para actualizaciones
      intervalId = setInterval(simulateRealTimeData, UPDATE_INTERVAL);
    };

    // Intentar configurar MQTT, si falla usar simulación
    setupMqtt().catch((err) => {
      console.error("Error configurando MQTT:", err);
      setupSimulation();
    });

    // Limpieza al desmontar
    return () => {
      if (intervalId) clearInterval(intervalId);
      
      if (mqttClient) {
        try {
          console.log("Desconectando cliente MQTT");
          mqttClient.end();
        } catch (e) {
          console.error("Error al desconectar MQTT:", e);
        }
      }
    };
  }, []);

  // Función pública para publicar un mensaje (para simulador)
  const publishMessage = (topic: string, message: string) => {
    if (client && connected) {
      // En modo real, publicamos al broker
      try {
        client.publish(topic, message);
        console.log("Mensaje publicado:", topic, message);
        return true;
      } catch (error) {
        console.error("Error al publicar mensaje:", error);
        return false;
      }
    } else {
      // En modo simulación, procesamos localmente
      console.log("Publicación simulada:", topic, message);
      try {
        const parsedMessage = JSON.parse(message);

        // Manejar el mensaje localmente para simular un entorno MQTT real
        if (topic === MQTT_TOPICS.PASSENGER_COUNT) {
          setSensorData((prev) => ({
            ...prev,
            lastReading: new Date(),
            totalDetections: prev.totalDetections + (parsedMessage.count || 0),
            busId: parsedMessage.busId || prev.busId,
            routeId: parsedMessage.routeId || prev.routeId,
            isOnline: true,
          }));
        } else if (topic === MQTT_TOPICS.STATUS) {
          setSensorData((prev) => ({
            ...prev,
            lastReading: new Date(),
            busId: parsedMessage.busId || prev.busId,
            routeId: parsedMessage.routeId || prev.routeId,
            batteryLevel:
              parsedMessage.batteryLevel !== undefined
                ? parsedMessage.batteryLevel
                : prev.batteryLevel,
            isOnline: parsedMessage.status === "active",
          }));
        }

        return true;
      } catch (error) {
        console.error("Error procesando mensaje simulado:", error);
        return false;
      }
    }
  };

  // Hacer disponible el método de publicación
  (PassengerSensorStats as any).publishMessage = publishMessage;

  // Formatear tiempo transcurrido
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seg`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    return `${Math.floor(seconds / 86400)} d`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Sensor de Pasajeros ESP32</ThemedText>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: sensorData.isOnline ? "#4CAF50" : "#F44336" },
          ]}
        />
      </View>

      <ThemedView style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={accentColor} />
          <ThemedText style={styles.statValue}>
            {sensorData.totalDetections}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Pasajeros detectados</ThemedText>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={accentColor} />
          <ThemedText style={styles.statValue}>
            {getTimeAgo(sensorData.lastReading)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Última lectura</ThemedText>
        </View>

        {sensorData.batteryLevel !== undefined && (
          <View style={styles.statItem}>
            <Ionicons
              name={
                sensorData.batteryLevel > 20 ? "battery-half" : "battery-dead"
              }
              size={24}
              color={accentColor}
            />
            <ThemedText style={styles.statValue}>
              {sensorData.batteryLevel}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Batería</ThemedText>
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Bus ID: </ThemedText>
          {sensorData.busId}
        </ThemedText>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Ruta: </ThemedText>
          {sensorData.routeId}
        </ThemedText>
        <ThemedText style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Estado: </ThemedText>
          {sensorData.isOnline ? "Activo" : "Inactivo"}
        </ThemedText>
        <ThemedText style={[
          styles.connectionStatus, 
          { color: connected ? "#4CAF50" : simulationMode ? "#F57F17" : "#F44336" }
        ]}>
          {connected 
            ? "Conectado al broker MQTT" 
            : simulationMode 
              ? "Modo simulación (MQTT no disponible)" 
              : "Desconectado (intentando conectar...)"}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  infoContainer: {
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  connectionStatus: {
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});
