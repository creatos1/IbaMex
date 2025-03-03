
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración del servidor
const char* serverUrl = "http://tu-servidor-api.com/api/occupancy/update";
const String busId = "ID_DEL_BUS"; // ID del bus en la base de datos

// Pines de los sensores
const int entrySensorPin = D1;  // Sensor de entrada
const int exitSensorPin = D2;   // Sensor de salida

// Variables para contar
volatile int enterCount = 0;
volatile int exitCount = 0;
unsigned long lastSendTime = 0;
const int sendInterval = 5000; // Enviar datos cada 5 segundos

// Variables para detectar movimiento
volatile bool entryDetected = false;
volatile bool exitDetected = false;
unsigned long entryDebounceTime = 0;
unsigned long exitDebounceTime = 0;
const int debounceDelay = 1000; // 1 segundo de debounce

void ICACHE_RAM_ATTR handleEntrySensor() {
  unsigned long currentTime = millis();
  if (currentTime - entryDebounceTime > debounceDelay) {
    enterCount++;
    entryDetected = true;
    entryDebounceTime = currentTime;
    Serial.println("Persona entrando");
  }
}

void ICACHE_RAM_ATTR handleExitSensor() {
  unsigned long currentTime = millis();
  if (currentTime - exitDebounceTime > debounceDelay) {
    exitCount++;
    exitDetected = true;
    exitDebounceTime = currentTime;
    Serial.println("Persona saliendo");
  }
}

void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(entrySensorPin, INPUT_PULLUP);
  pinMode(exitSensorPin, INPUT_PULLUP);
  
  // Configurar interrupciones
  attachInterrupt(digitalPinToInterrupt(entrySensorPin), handleEntrySensor, FALLING);
  attachInterrupt(digitalPinToInterrupt(exitSensorPin), handleExitSensor, FALLING);
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a WiFi!");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentTime = millis();
  
  // Enviar datos periódicamente o cuando hay cambios
  if ((currentTime - lastSendTime > sendInterval && (enterCount > 0 || exitCount > 0)) || 
      entryDetected || exitDetected) {
    
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      http.begin(client, serverUrl);
      http.addHeader("Content-Type", "application/json");
      
      // Crear JSON
      StaticJsonDocument<200> doc;
      doc["busId"] = busId;
      JsonObject sensorData = doc.createNestedObject("sensorData");
      sensorData["enter"] = enterCount;
      sensorData["exit"] = exitCount;
      
      String requestBody;
      serializeJson(doc, requestBody);
      
      // Enviar datos
      int httpResponseCode = http.POST(requestBody);
      
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Respuesta HTTP: " + String(httpResponseCode));
        Serial.println(response);
        
        // Resetear contadores
        enterCount = 0;
        exitCount = 0;
      } else {
        Serial.print("Error en la solicitud HTTP: ");
        Serial.println(httpResponseCode);
      }
      
      http.end();
    } else {
      Serial.println("WiFi desconectado. Reconectando...");
      WiFi.reconnect();
    }
    
    lastSendTime = currentTime;
    entryDetected = false;
    exitDetected = false;
  }
}
