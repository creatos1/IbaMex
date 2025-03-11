
# MQTT Setup Guide for IbaMex App

This document outlines how to set up real MQTT communication between ESP32 sensors and the IbaMex app.

## Prerequisites

1. ESP32 device(s) with passenger counter sensors
2. MQTT broker (e.g., HiveMQ, Mosquitto, AWS IoT)
3. IbaMex app with proper MQTT client

## Installing MQTT Client for React Native

To use MQTT in a React Native/Expo app, you need a compatible MQTT client library. Here are the options:

### Option 1: react-native-mqtt (recommended)

```bash
npm install react-native-mqtt
```

Make sure to link the library properly:

```bash
npx react-native link react-native-mqtt
```

### Option 2: MQTT.js with a websocket broker

```bash
npm install mqtt
```

MQTT.js requires a websocket connection for React Native/Expo.

## Code Implementation 

1. Replace the simulation code in `PassengerSensorStats.tsx` with the real MQTT implementation
2. Configure the broker details in the app
3. Test with real ESP32 devices

## MQTT Topics

- `ibamex/bus/passenger/count` - For passenger count updates
- `ibamex/bus/status` - For bus/sensor status updates

## Message Format

### Passenger Count Message:
```json
{
  "busId": "BUS123",
  "routeId": "R1-Centro",
  "count": 42
}
```

### Status Message:
```json
{
  "busId": "BUS123",
  "routeId": "R1-Centro",
  "batteryLevel": 85,
  "status": "active"
}
```

## Testing

Before deploying to production, test with the MQTTSimulator component included in the app.
