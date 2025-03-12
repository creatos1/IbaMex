
# Configuración del Sistema de Conteo de Pasajeros

Este documento explica cómo configurar y usar el sistema de conteo de pasajeros basado en ESP32 y MQTT.

## Configuración del ESP32

### Requisitos de Hardware
- ESP32 (cualquier variante)
- Sensor PIR de movimiento (HC-SR501 o similar)
- Cables de conexión
- Cable micro USB para programación

### Conexiones
1. Conecta el sensor PIR al ESP32:
   - VCC del sensor → 3.3V o 5V del ESP32
   - GND del sensor → GND del ESP32
   - Señal del sensor → Pin GPIO 13 del ESP32

### Programación del ESP32
1. Instala el IDE de Arduino si aún no lo tienes
2. Instala soporte para ESP32 en el IDE de Arduino
3. Instala las bibliotecas necesarias:
   - PubSubClient (MQTT)
4. Abre el archivo `ArduinoEsp32code.ino`
5. Modifica las siguientes líneas con tus credenciales:
   ```c
   const char* ssid = "TU_WIFI_SSID";       // CAMBIAR por tu WiFi
   const char* password = "TU_WIFI_PASS";   // CAMBIAR por tu contraseña
   ```
6. Conecta el ESP32 a tu computadora
7. Selecciona la placa y puerto correctos en el IDE
8. Sube el código al ESP32

## Configuración del Servidor

1. Instala las dependencias del servidor:
   ```
   npm install
   ```
2. Configura las variables de entorno (opcional):
   - MQTT_HOST: Broker MQTT (default: broker.emqx.io)
   - MQTT_PORT: Puerto del broker (default: 1883)
   - MQTT_PROTOCOL: Protocolo MQTT (default: mqtt)

3. Inicia el servidor:
   ```
   npm start
   ```

## Configuración de la App Cliente

1. Navega a la carpeta client:
   ```
   cd client
   ```

2. Instala las dependencias:
   ```
   npm install
   ```
   
3. Inicia la aplicación con Expo:
   ```
   npx expo start
   ```

4. Escanea el código QR con la app Expo Go en tu dispositivo móvil

## Funcionamiento

1. El ESP32 detecta movimiento con el sensor PIR
2. Cada vez que detecta movimiento, incrementa el contador
3. El ESP32 envía el contador actualizado al broker MQTT
4. El servidor recibe los datos del ESP32 y los almacena en la base de datos
5. La app cliente se suscribe a los mismos tópicos MQTT y muestra los datos en tiempo real

## Pruebas

Para probar el sistema sin hardware:

1. Usa un cliente MQTT como MQTT Explorer o MQTT X
2. Conéctate al mismo broker (broker.emqx.io)
3. Publica mensajes en el tópico `buses/ESP32_001/count` con el formato:
   ```json
   {"count": 5}
   ```
4. La app cliente debería mostrar el valor actualizado

## Solución de problemas

### El ESP32 no se conecta a WiFi
- Verifica las credenciales WiFi
- Asegúrate de que la red esté disponible y sea 2.4GHz (ESP32 no soporta 5GHz)

### Los mensajes MQTT no se reciben
- Verifica la conexión al broker
- Confirma que los tópicos sean exactamente iguales
- Asegúrate de que el formato del mensaje sea correcto

### El sensor no detecta movimiento
- Ajusta la sensibilidad y el tiempo de espera del sensor PIR
- Verifica la conexión del sensor
- Prueba el sensor con un LED directo para verificar que funciona
