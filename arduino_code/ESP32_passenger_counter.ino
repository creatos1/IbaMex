
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración MQTT
const char* mqtt_server = "broker.hivemq.com"; // Broker público gratuito
const int mqtt_port = 1883;
const char* mqtt_topic_count = "ibamex/bus/passenger/count";
const char* mqtt_topic_status = "ibamex/bus/status";
const char* mqtt_client_id = "ESP32_BusCounter";

// Configuración de pines
const int PIR_PIN = 13;       // Pin del sensor PIR
const int LED_PIN = 2;        // LED para indicar movimiento detectado
const int BATTERY_PIN = 34;   // Pin para leer nivel de batería (ADC)

// Configuración ID y Ruta
String busId = "BUS001";      // ID del autobús (personaliza según el bus)
String routeId = "ROUTE001";  // ID de la ruta (personaliza según la ruta)

// Variables globales
int passengerCount = 0;
float batteryLevel = 100.0;   // Nivel de batería en porcentaje

// Intervalo para enviar actualizaciones (en ms)
const long updateInterval = 10000; // 10 segundos
unsigned long lastUpdateTime = 0;

// Debounce para el sensor PIR
unsigned long lastDetectionTime = 0;
const long detectionDelay = 2000; // 2 segundos entre detecciones para evitar múltiples conteos

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Sistema de conteo de pasajeros inicializado");
  
  // Conectar a WiFi
  setupWifi();
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  // Reconectar MQTT si es necesario
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Detectar movimiento (entrada de pasajero)
  int pirState = digitalRead(PIR_PIN);
  
  // Si se detecta movimiento y ha pasado suficiente tiempo desde la última detección
  if (pirState == HIGH && (millis() - lastDetectionTime) > detectionDelay) {
    lastDetectionTime = millis();
    digitalWrite(LED_PIN, HIGH);  // Encender LED
    
    // Incrementar contador
    passengerCount++;
    Serial.print("¡Pasajero detectado! Total: ");
    Serial.println(passengerCount);
    
    // Enviar actualización inmediata
    sendPassengerCount();
    
    delay(500);  // Pequeño delay para el LED
    digitalWrite(LED_PIN, LOW);   // Apagar LED
  }

  // Leer nivel de batería
  readBatteryLevel();

  // Enviar actualizaciones periódicas
  if (millis() - lastUpdateTime > updateInterval) {
    sendStatusUpdate();
    lastUpdateTime = millis();
  }
}

void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Manejar mensajes recibidos (por ahora solo imprimimos)
  Serial.print("Mensaje recibido [");
  Serial.print(topic);
  Serial.print("] ");
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  // Reconectar al servidor MQTT
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    
    if (client.connect(mqtt_client_id)) {
      Serial.println("conectado");
      // Suscribirse a temas si es necesario
      // client.subscribe("ibamex/bus/commands");
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentando de nuevo en 5 segundos");
      delay(5000);
    }
  }
}

void readBatteryLevel() {
  // Leer el voltaje de la batería y convertirlo a porcentaje
  // Esta función debe adaptarse a tu hardware específico
  
  int rawValue = analogRead(BATTERY_PIN);
  float voltage = rawValue * (3.3 / 4095.0); // Para ESP32 con referencia de 3.3V
  
  // Simulación de conversión de voltaje a porcentaje
  // Adapta estos valores a tu batería real
  // Asumiendo que 4.2V es 100% y 3.0V es 0%
  float percentage = ((voltage - 3.0) / 1.2) * 100.0;
  
  // Limitar a rango 0-100
  batteryLevel = constrain(percentage, 0.0, 100.0);
  
  // Simulación de descarga gradual para pruebas
  // En un entorno real, comentar esta línea
  batteryLevel = max(0.0, batteryLevel - 0.01);
}

void sendPassengerCount() {
  // Crear un objeto JSON
  StaticJsonDocument<200> doc;
  doc["busId"] = busId;
  doc["routeId"] = routeId;
  doc["count"] = passengerCount;
  doc["timestamp"] = millis();
  doc["batteryLevel"] = (int)batteryLevel;
  
  // Convertir a cadena
  char buffer[256];
  serializeJson(doc, buffer);
  
  // Publicar en MQTT
  client.publish(mqtt_topic_count, buffer);
  Serial.print("Dato enviado: ");
  Serial.println(buffer);
}

void sendStatusUpdate() {
  // Crear un objeto JSON con datos del estado actual
  StaticJsonDocument<200> doc;
  doc["busId"] = busId;
  doc["routeId"] = routeId;
  doc["passengerCount"] = passengerCount;
  doc["status"] = "active";
  doc["batteryLevel"] = (int)batteryLevel;
  doc["timestamp"] = millis();
  
  // Convertir a cadena
  char buffer[256];
  serializeJson(doc, buffer);
  
  // Publicar en MQTT
  client.publish(mqtt_topic_status, buffer);
}
