
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// This component is for development only
// It simulates sending MQTT messages to test the app without actual hardware

export default function MQTTSimulator() {
  const [busId, setBusId] = useState('BUS101');
  const [routeId, setRouteId] = useState('R1-Centro');
  const [passengerCount, setPassengerCount] = useState('0');
  const [batteryLevel, setBatteryLevel] = useState('100');
  const [logs, setLogs] = useState<string[]>([]);

  const simulateSendMQTT = () => {
    // In a real implementation, this would send MQTT messages
    // For now, we just log what would be sent
    
    const countMessage = {
      busId,
      routeId,
      count: parseInt(passengerCount, 10) || 0
    };
    
    const statusMessage = {
      busId,
      routeId,
      batteryLevel: parseInt(batteryLevel, 10) || 100,
      status: 'active'
    };
    
    // Log the messages
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Sent passenger count: ${JSON.stringify(countMessage)}`,
      `[${new Date().toLocaleTimeString()}] Sent status update: ${JSON.stringify(statusMessage)}`,
      ...prev.slice(0, 10) // Keep only the last 10 logs
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>MQTT Simulator (Dev Only)</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText>Bus ID:</ThemedText>
        <TextInput
          style={styles.input}
          value={busId}
          onChangeText={setBusId}
          placeholder="Enter Bus ID"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText>Route:</ThemedText>
        <TextInput
          style={styles.input}
          value={routeId}
          onChangeText={setRouteId}
          placeholder="Enter Route ID"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText>Passenger Count:</ThemedText>
        <TextInput
          style={styles.input}
          value={passengerCount}
          onChangeText={setPassengerCount}
          keyboardType="numeric"
          placeholder="Enter passenger count"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText>Battery Level (%):</ThemedText>
        <TextInput
          style={styles.input}
          value={batteryLevel}
          onChangeText={setBatteryLevel}
          keyboardType="numeric"
          placeholder="Enter battery level"
        />
      </View>
      
      <Button title="Simulate MQTT Message" onPress={simulateSendMQTT} />
      
      <ThemedText style={styles.logsTitle}>Logs:</ThemedText>
      <ScrollView style={styles.logs}>
        {logs.map((log, index) => (
          <ThemedText key={index} style={styles.logText}>{log}</ThemedText>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginLeft: 8,
  },
  logsTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  logs: {
    maxHeight: 200,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  logText: {
    fontSize: 12,
    marginBottom: 4,
  }
});
