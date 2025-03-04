import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

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
  busId: "Not connected",
  routeId: "Not connected",
  batteryLevel: 100,
  isOnline: false,
};

// MQTT configuration - Use public test broker for demo
const MQTT_BROKER_URL = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_CLIENT_ID = `ibamex_app_${Math.random().toString(16).substring(2, 10)}`;
const MQTT_TOPICS = {
  PASSENGER_COUNT: "ibamex/bus/passenger/count",
  STATUS: "ibamex/bus/status",
};

export default function PassengerSensorStats() {
  const [sensorData, setSensorData] = useState<SensorData>(initialData);
  const [connected, setConnected] = useState(false);
  const accentColor = useThemeColor(
    { light: "#0a7ea4", dark: "#2f95dc" },
    "tint",
  );

  // Initialize MQTT client
  useEffect(() => {
    let mqttClient: any = null;

    const setupMqtt = async () => {
      try {
        console.log("Initializing MQTT client for native");

        // For React Native, we need a different approach
        if (Platform.OS !== "web") {
          // This will be a no-op if running in the Expo environment
          // We'll rely on simulation mode instead
          throw new Error(
            "MQTT direct connection not supported in this environment",
          );
        } else {
          // For web, we might be able to use the mqtt library via webpack
          // But for now, we'll use simulation to ensure consistency
          throw new Error("Using simulation mode for consistency");
        }
      } catch (error) {
        console.error("Failed to initialize MQTT:", error);
        // Fall back to simulation mode
        setupSimulation();
      }
    };

    // Intentar configurar MQTT, en caso de error usar simulación
    try {
      setupMqtt();
    } catch (error) {
      console.error("Error setting up MQTT:", error);
      setupSimulation();
    }

    return () => {
      if (mqttClient) {
        console.log("Disconnecting MQTT client");
        try {
          mqttClient.end();
        } catch (e) {
          console.error("Error disconnecting MQTT:", e);
        }
      }
    };
  }, []);

  // Fallback to simulation when MQTT fails
  const setupSimulation = () => {
    console.log("Setting up simulation mode");
    const UPDATE_INTERVAL = 5000; // milliseconds

    const simulateRealTimeData = () => {
      // Simulate a new random count increase (0-5 passengers)
      const newPassengers = Math.floor(Math.random() * 6);

      // Simulate a random battery decrease (0-2%)
      const batteryDecrease = Math.random() * 2;

      // Random bus ID (for simulation)
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
        isOnline: Math.random() > 0.1, // 90% chance of being online
      }));
    };

    // Initial update
    simulateRealTimeData();

    // Set up interval for updates
    const intervalId = setInterval(simulateRealTimeData, UPDATE_INTERVAL);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  };

  // Public method to publish a message (for simulator)
  const publishMessage = (topic: string, message: string) => {
    // In simulation mode, we just log the message and return false
    console.log("Simulated publish:", topic, message);
    try {
      const parsedMessage = JSON.parse(message);

      // Handle the message locally to simulate a real MQTT environment
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
      console.error("Error processing simulated message:", error);
      return false;
    }
  };

  // Make the publish method available
  (PassengerSensorStats as any).publishMessage = publishMessage;

  // Format elapsed time
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
        <ThemedText style={[styles.connectionStatus, { color: "#F57F17" }]}>
          Modo simulación (MQTT no disponible)
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
