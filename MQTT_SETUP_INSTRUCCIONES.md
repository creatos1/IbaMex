# Instrucciones para la Configuración MQTT

## Información Importante sobre el Modo de Simulación

Actualmente, la aplicación está funcionando en **modo de simulación** debido a limitaciones de compatibilidad con MQTT en React Native/Expo. Esto significa que:

1. No hay conexión real a un broker MQTT
2. Los datos mostrados son generados aleatoriamente
3. El funcionamiento del simulador MQTT incorporado sigue siendo válido para pruebas

## Para implementación real en producción:

Para una implementación real, sería necesario:

1. Utilizar una biblioteca MQTT específica para React Native como:
   - react_native_mqtt
   - paho-mqtt adaptada para React Native

2. Modificar el componente PassengerSensorStats.tsx para utilizar estas bibliotecas

3. Configurar correctamente los brokers y temas MQTT

## Configuración del ESP32

El código del ESP32 sigue siendo válido y se puede utilizar sin cambios para enviar datos a un broker MQTT real. Consulta el archivo `arduino_code/ESP32_passenger_counter.ino` para más detalles.


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

## Pruebas con el Simulador

Para probar la aplicación con el simulador MQTT incluido:

1. Navega a la sección de simulación MQTT en la aplicación
2. Utiliza los presets predefinidos o crea tus propios mensajes JSON
3. Publica los mensajes para ver cómo la interfaz responde a los datos

## Solución de problemas comunes

Si experimentas errores relacionados con MQTT, asegúrate de que:

1. La aplicación esté en modo de simulación (comportamiento predeterminado)
2. El formato JSON sea correcto cuando uses el simulador
3. Los temas MQTT sean los correctos ('ibamex/bus/passenger/count' y 'ibamex/bus/status')

## Pruebas y Verificación

Para verificar que todo funciona correctamente:

1. Abre el Monitor Serie del Arduino IDE después de cargar el código al ESP32
2. Deberías ver mensajes indicando:
   - Conexión a WiFi exitosa
   - Conexión a MQTT exitosa
   - Mensajes de estado periódicos

3. En la aplicación:
   - El indicador "Conectado al broker MQTT" debería aparecer en verde (en modo simulación, esto puede no ser aplicable)
   - Al activar los sensores del ESP32, deberías ver los conteos actualizarse (en modo simulación, los datos son aleatorios)
   - El estado de la batería y otros datos deberían actualizarse periódicamente (en modo simulación, los datos son aleatorios)

## Diagnóstico de Problemas

### El ESP32 no se conecta a WiFi
- Verifica las credenciales WiFi (SSID y contraseña)
- Asegúrate de que la red WiFi esté disponible y tenga acceso a internet
- Comprueba el monitor serie para mensajes de error

### La aplicación no recibe mensajes MQTT
- Verifica que el broker MQTT (HiveMQ) esté accesible (en modo simulación, esto no es aplicable)
- Confirma que los temas (topics) MQTT coincidan exactamente (en modo simulación, usar los temas del simulador)
- Reinicia la aplicación y el ESP32

### Los sensores no detectan correctamente
- Verifica el cableado y conexiones
- Ajusta la sensibilidad de los sensores PIR
- Prueba con un simple botón para simular la detección