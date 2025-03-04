
# Guía de Configuración de ESP32 con MQTT para IbaMex

Esta guía te ayudará a configurar la comunicación MQTT entre los sensores ESP32 y la aplicación IbaMex.

## Requisitos Previos

1. ESP32 con sensores de conteo de pasajeros
2. Arduino IDE instalado
3. Biblioteca PubSubClient y ArduinoJson instaladas en Arduino IDE
4. Acceso a una red WiFi

## Pasos para configurar el ESP32

### 1. Instalar bibliotecas necesarias

En Arduino IDE, ve a `Sketch > Include Library > Manage Libraries` y busca e instala:
- PubSubClient
- ArduinoJson (versión 6.x o superior)

### 2. Configurar el código del ESP32

1. Abre el archivo `arduino_code/ESP32_passenger_counter.ino` en Arduino IDE
2. Modifica las siguientes líneas con tu información:

```cpp
// Configuración WiFi
const char* ssid = "TuRedWiFi";          // CAMBIAR POR TU RED WIFI
const char* password = "TuContraseña";   // CAMBIAR POR TU CONTRASEÑA

// ID único para cada unidad
const char* mqtt_client_id = "esp32_bus101";   // CAMBIAR PARA CADA UNIDAD
const char* busId = "BUS101";                  // CAMBIAR PARA CADA UNIDAD
const char* routeId = "R1-Centro";             // CAMBIAR PARA CADA RUTA
```

### 3. Conectar el sensor

Conecta el sensor de conteo de pasajeros al ESP32:
- El sensor debe estar conectado al pin definido en `sensorPin` (por defecto pin 5)
- Puedes usar un sensor infrarrojo, ultrasónico o similar para detectar pasajeros

### 4. Cargar el código al ESP32

1. Conecta el ESP32 a tu computadora
2. Selecciona la placa correcta en Arduino IDE (`Tools > Board > ESP32`)
3. Selecciona el puerto correcto
4. Carga el código

### 5. Verificar funcionamiento

1. Abre el Monitor Serial en Arduino IDE para verificar los mensajes
2. Verifica que el ESP32 se conecta a WiFi y al broker MQTT
3. Prueba el sensor para ver si los conteos de pasajeros se registran y envían

## Solución de problemas

### El ESP32 no se conecta a WiFi
- Verifica que las credenciales WiFi sean correctas
- Asegúrate de que la red WiFi esté disponible y tenga acceso a internet

### Mensajes MQTT no llegan a la aplicación
- Verifica que el broker MQTT esté accesible (broker.hivemq.com es público)
- Confirma que los temas (topics) MQTT coincidan entre la aplicación y el ESP32
- Asegúrate de que el formato JSON de los mensajes sea correcto

### El sensor no detecta pasajeros
- Verifica la conexión del sensor al ESP32
- Ajusta la sensibilidad o el tiempo de debounce según sea necesario

## Configuración para múltiples unidades

Para cada autobús o unidad:
1. Cambia el `mqtt_client_id` para que sea único
2. Modifica `busId` para que coincida con el ID del autobús
3. Actualiza `routeId` según la ruta asignada
4. Carga el código actualizado a cada ESP32

## Formato de los mensajes MQTT

### Mensaje de conteo de pasajeros (`ibamex/bus/passenger/count`):
```json
{
  "busId": "BUS101",
  "routeId": "R1-Centro",
  "count": 1
}
```

### Mensaje de estado (`ibamex/bus/status`):
```json
{
  "busId": "BUS101",
  "routeId": "R1-Centro",
  "batteryLevel": 85,
  "status": "active"
}
```

## Probando con la aplicación IbaMex

Una vez configurado el ESP32, abre la aplicación IbaMex y navega a la pantalla de análisis o estadísticas. Deberías ver los datos de pasajeros actualizándose en tiempo real cuando se detectan pasajeros.
