
# Instrucciones de Configuración MQTT para IbaMex

Esta guía te ayudará a configurar correctamente la comunicación MQTT entre los sensores ESP32 y la aplicación móvil IbaMex.

## 1. Configuración del ESP32

### Requisitos de hardware
- Placa ESP32
- Sensores PIR (2 unidades) u otro sensor de detección de pasajeros
- LED y buzzer (opcional)
- Cables y protoboard

### Instalación de software
1. Instala Arduino IDE desde [arduino.cc](https://www.arduino.cc/en/software)
2. Agrega soporte para ESP32:
   - Abre Arduino IDE
   - Ve a Archivo > Preferencias
   - En "URLs adicionales de Gestor de Placas" añade:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Ve a Herramientas > Placa > Gestor de Placas
   - Busca "esp32" e instala el paquete

3. Instala las bibliotecas necesarias:
   - Ve a Herramientas > Administrar Bibliotecas
   - Busca e instala:
     - PubSubClient (para MQTT)
     - ArduinoJson (versión 6.x)

### Configuración del código
1. Abre el archivo `arduino_code/ESP32_passenger_counter.ino`
2. Modifica los siguientes valores:
   ```cpp
   // Configuración de WiFi
   const char* ssid = "TuRedWiFi";        // CAMBIAR
   const char* password = "TuContraseña";  // CAMBIAR
   
   // Identificación única
   const char* mqtt_client_id = "ESP32_BUS101";  // CAMBIAR (único para cada ESP32)
   const char* bus_id = "BUS101";               // CAMBIAR (ID del autobús)
   const char* route_id = "R1-Centro";          // CAMBIAR (ruta del autobús)
   ```

3. Verifica los pines de conexión:
   ```cpp
   const int pinPIR_entrada = 13;  // Cambia según tu conexión
   const int pinPIR_salida = 14;   // Cambia según tu conexión
   const int pinLED = 2;           // LED integrado en ESP32
   const int pinBuzzer = 12;       // Opcional
   ```

4. Carga el programa a tu ESP32:
   - Conecta el ESP32 a tu computadora
   - Selecciona la placa y puerto correctos en Herramientas
   - Presiona el botón "Subir"

## 2. Configuración de la Aplicación

La aplicación IbaMex ya está configurada para conectarse al broker MQTT público HiveMQ, por lo que no deberías necesitar cambiar nada en el código de la aplicación.

Sin embargo, si deseas utilizar un broker MQTT diferente, sigue estos pasos:

1. Abre el archivo `components/PassengerSensorStats.tsx`
2. Busca y modifica la configuración MQTT:
   ```typescript
   const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
   const MQTT_CLIENT_ID = `ibamex_app_${Math.random().toString(16).substring(2, 10)}`;
   const MQTT_TOPICS = {
     PASSENGER_COUNT: 'ibamex/bus/passenger/count',
     STATUS: 'ibamex/bus/status'
   };
   ```

## 3. Pruebas y Verificación

Para verificar que todo funciona correctamente:

1. Abre el Monitor Serie del Arduino IDE después de cargar el código al ESP32
2. Deberías ver mensajes indicando:
   - Conexión a WiFi exitosa
   - Conexión a MQTT exitosa
   - Mensajes de estado periódicos

3. En la aplicación:
   - El indicador "Conectado al broker MQTT" debería aparecer en verde
   - Al activar los sensores del ESP32, deberías ver los conteos actualizarse
   - El estado de la batería y otros datos deberían actualizarse periódicamente

## 4. Diagnóstico de Problemas

### El ESP32 no se conecta a WiFi
- Verifica las credenciales WiFi (SSID y contraseña)
- Asegúrate de que la red WiFi esté disponible y tenga acceso a internet
- Comprueba el monitor serie para mensajes de error

### La aplicación no recibe mensajes MQTT
- Verifica que el broker MQTT (HiveMQ) esté accesible
- Confirma que los temas (topics) MQTT coincidan exactamente
- Reinicia la aplicación y el ESP32

### Los sensores no detectan correctamente
- Verifica el cableado y conexiones
- Ajusta la sensibilidad de los sensores PIR
- Prueba con un simple botón para simular la detección
