
# Instrucciones para la Configuración MQTT del Proyecto IbaMex

## Resumen del Funcionamiento

El sistema ahora cuenta con:

1. **Modo Real**: Intenta conectarse a un broker MQTT real (HiveMQ) para recibir datos de los sensores ESP32.
2. **Modo Simulación**: Si la conexión MQTT falla, se activa automáticamente el modo simulación para pruebas.
3. **Simulador MQTT**: Permite enviar mensajes de prueba para verificar la funcionalidad sin necesidad de hardware.

## Configuración del ESP32

### Material necesario
- Placa ESP32 (cualquier modelo como ESP32-WROOM, ESP32-DevKitC, NodeMCU-ESP32, etc.)
- 2 sensores PIR (HC-SR501 o similar)
- LED (opcional - el ESP32 tiene uno integrado)
- Buzzer (opcional)
- Cables jumper
- Protoboard
- Cable micro USB para programación

### Conexiones
1. Conectar sensor PIR de entrada al pin GPIO 13
2. Conectar sensor PIR de salida al pin GPIO 14
3. Conectar buzzer (opcional) al pin GPIO 12
4. El LED integrado (pin GPIO 2) se utilizará como indicador

### Instalación del Software
1. Instala el Arduino IDE desde [arduino.cc](https://www.arduino.cc/en/software)
2. Agrega soporte para ESP32:
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

### Configuración del código del ESP32
1. Abre el archivo `arduino_code/ESP32_passenger_counter.ino`
2. Modifica las siguientes líneas:
   ```cpp
   // Configuración de WiFi
   const char* ssid = "TuRedWiFi";        // CAMBIAR: Nombre de tu red WiFi
   const char* password = "TuContraseña";  // CAMBIAR: Contraseña de tu red WiFi
   
   // Configuración de MQTT (no es necesario cambiar si usas el broker público)
   const char* mqtt_server = "broker.hivemq.com";
   const int mqtt_port = 1883;
   
   // Identificación única
   const char* mqtt_client_id = "ESP32_BUS101";  // CAMBIAR: único para cada ESP32
   const char* bus_id = "BUS101";               // CAMBIAR: ID del autobús
   const char* route_id = "R1-Centro";          // CAMBIAR: ruta del autobús
   ```

3. Verifica que los pines correspondan a tus conexiones:
   ```cpp
   const int pinPIR_entrada = 13;
   const int pinPIR_salida = 14;
   const int pinLED = 2;         // LED integrado en ESP32
   const int pinBuzzer = 12;     // 0 para desactivar
   ```

### Carga del Programa
1. Conecta el ESP32 a tu computadora
2. Selecciona la placa correcta en Herramientas > Placa
3. Selecciona el puerto en Herramientas > Puerto
4. Presiona el botón de carga (flecha a la derecha)
5. Si es necesario, mantén presionado el botón BOOT del ESP32 durante la carga

## Funcionamiento del Aplicativo

### Modos de Operación

#### Modo Real
- La aplicación intenta conectarse automáticamente a un broker MQTT (HiveMQ)
- Los datos mostrados provienen directamente del ESP32
- El indicador de conexión mostrará "Conectado al broker MQTT" en verde

#### Modo Simulación (Fallback)
- Se activa automáticamente si la conexión MQTT falla
- Genera datos aleatorios para demostración
- El indicador mostrará "Modo simulación (MQTT no disponible)" en naranja

### Simulador MQTT Incorporado
El simulador permite enviar mensajes MQTT manualmente para probar la aplicación:

1. Navega a la sección del simulador MQTT
2. Selecciona un tema (topic): 
   - `ibamex/bus/passenger/count` - Para enviar conteos de pasajeros
   - `ibamex/bus/status` - Para enviar datos de estado del bus
3. Escribe un mensaje JSON o selecciona un preset
4. Presiona "Publicar mensaje"

Ejemplos de mensajes JSON:

**Para contar pasajeros:**
```json
{
  "busId": "BUS101",
  "routeId": "R1-Centro",
  "count": 5
}
```

**Para actualizar estado:**
```json
{
  "busId": "BUS101",
  "routeId": "R1-Centro",
  "batteryLevel": 85,
  "status": "active"
}
```

## Solución de Problemas

### El ESP32 no se conecta a la red WiFi
- Verifica las credenciales WiFi (SSID y contraseña)
- Comprueba que la red tenga acceso a internet
- Verifica que la red no tenga restricciones de conexión

### La aplicación no recibe datos MQTT
- Asegúrate de que el broker MQTT esté accesible (broker.hivemq.com:1883)
- Verifica que el ESP32 esté conectado y enviando datos
- Comprueba que los temas (topics) MQTT sean correctos

### Los sensores no detectan correctamente
- Verifica el cableado y conexiones
- Ajusta la sensibilidad de los sensores PIR
- Asegúrate de que los sensores reciban alimentación adecuada (normalmente 5V)

### Conexión inestable
- Añade una alimentación externa al ESP32 (no solo USB)
- Ubica el ESP32 en un lugar con buena señal WiFi
- Verifica que no haya interferencia electromagnética cerca
