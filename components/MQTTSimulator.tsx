
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TextInput, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import PassengerSensorStats from './PassengerSensorStats';

interface SimulatedMessage {
  topic: string;
  payload: string;
  timestamp: Date;
  success: boolean;
}

// Mensajes preconfigurados para simulación rápida
const presetMessages = [
  {
    name: "Añadir 5 pasajeros",
    topic: "ibamex/bus/passenger/count",
    payload: {
      busId: "BUS101",
      routeId: "R1-Centro",
      count: 5
    }
  },
  {
    name: "Restar 2 pasajeros",
    topic: "ibamex/bus/passenger/count",
    payload: {
      busId: "BUS101",
      routeId: "R1-Centro",
      count: -2
    }
  },
  {
    name: "Estado activo",
    topic: "ibamex/bus/status",
    payload: {
      busId: "BUS101",
      routeId: "R1-Centro",
      batteryLevel: 95,
      status: "active"
    }
  },
  {
    name: "Estado inactivo",
    topic: "ibamex/bus/status",
    payload: {
      busId: "BUS101",
      routeId: "R1-Centro",
      batteryLevel: 15,
      status: "inactive"
    }
  },
  {
    name: "Cambio de ruta",
    topic: "ibamex/bus/status",
    payload: {
      busId: "BUS101",
      routeId: "R4-Aeropuerto",
      status: "active"
    }
  }
];

export default function MQTTSimulator() {
  const [topic, setTopic] = useState('ibamex/bus/passenger/count');
  const [message, setMessage] = useState(JSON.stringify({
    busId: "BUS101",
    routeId: "R1-Centro",
    count: 5,
    batteryLevel: 95,
    status: "active"
  }, null, 2));
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);

  const handlePublish = () => {
    try {
      // Validar JSON
      JSON.parse(message);
      
      // Publicar mensaje usando la función estática de PassengerSensorStats
      const success = (PassengerSensorStats as any).publishMessage(topic, message);
      
      // Añadir al historial de mensajes
      setMessages(prev => [
        {
          topic,
          payload: message,
          timestamp: new Date(),
          success
        },
        ...prev
      ].slice(0, 10)); // Mantener solo los últimos 10 mensajes
      
    } catch (e) {
      alert('Mensaje JSON inválido');
    }
  };

  const presetMessages = [
    {
      name: 'New passenger count',
      topic: 'ibamex/bus/passenger/count',
      payload: {
        busId: "BUS101",
        routeId: "R1-Centro",
        count: 5
      }
    },
    {
      name: 'Battery update',
      topic: 'ibamex/bus/status',
      payload: {
        busId: "BUS101",
        routeId: "R1-Centro",
        batteryLevel: 85,
        status: "active"
      }
    },
    {
      name: 'Device offline',
      topic: 'ibamex/bus/status',
      payload: {
        busId: "BUS101",
        routeId: "R1-Centro",
        batteryLevel: 20,
        status: "offline"
      }
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>ESP32 MQTT Simulator</ThemedText>
      
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Topic:</ThemedText>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="mqtt/topic"
        />
      </ThemedView>
      
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Message (JSON):</ThemedText>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter JSON message"
          multiline
          numberOfLines={4}
        />
      </ThemedView>
      
      <Button title="Publish Message" onPress={handlePublish} />
      
      <ThemedView style={styles.presets}>
        <ThemedText style={styles.presetsTitle}>Presets:</ThemedText>
        <ScrollView horizontal>
          {presetMessages.map((preset, index) => (
            <ThemedView key={index} style={styles.presetItem}>
              <Button 
                title={preset.name} 
                onPress={() => {
                  setTopic(preset.topic);
                  setMessage(JSON.stringify(preset.payload, null, 2));
                }} 
              />
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>
      
      <ThemedView style={styles.history}>
        <ThemedText style={styles.historyTitle}>Message History:</ThemedText>
        <ScrollView style={styles.historyList}>
          {messages.map((msg, index) => (
            <ThemedView key={index} style={styles.historyItem}>
              <ThemedText style={styles.historyTopic}>{msg.topic}</ThemedText>
              <ThemedText style={styles.historyTimestamp}>
                {msg.timestamp.toLocaleTimeString()}
              </ThemedText>
              <ThemedText style={styles.historyPayload}>{msg.payload}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  presets: {
    marginTop: 16,
  },
  presetsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  presetItem: {
    marginRight: 8,
  },
  history: {
    marginTop: 16,
  },
  historyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyTopic: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  historyTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  historyPayload: {
    fontSize: 12,
    fontFamily: 'monospace',
  }
});
