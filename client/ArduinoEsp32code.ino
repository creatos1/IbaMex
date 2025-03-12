
#include <WiFi.h>
#include <PubSubClient.h>

// Configuración WiFi
const char* ssid = "TU_WIFI_SSID";       // CAMBIAR por tu WiFi
const char* password = "TU_WIFI_PASS";   // CAMBIAR por tu contraseña

// Configuración MQTT
const char* mqtt_server = "broker.emqx.io";  // Broker MQTT público
const int mqtt_port = 1883;
const char* mqtt_topic = "buses/ESP32_001/count";
const char* mqtt_client_id = "ESP32_BUS_001";

// Pines
const int PIN_SENSOR = 13;  // Pin para el sensor PIR
const int PIN_LED = 2;      // LED integrado en ESP32

// Variables
int passengerCount = 0;
int lastState = LOW;
unsigned long lastSendTime = 0;
const int SEND_INTERVAL = 2000;  // Intervalo de envío en ms

// Objetos
WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
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

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect(mqtt_client_id)) {
      Serial.println("conectado");
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentando de nuevo en 5 segundos");
      delay(5000);
    }
  }
}

void sendMQTTMessage() {
  char msg[50];
  sprintf(msg, "{\"count\": %d}", passengerCount);
  
  Serial.print("Publicando mensaje: ");
  Serial.println(msg);
  
  client.publish(mqtt_topic, msg);
}

void setup() {
  pinMode(PIN_SENSOR, INPUT);
  pinMode(PIN_LED, OUTPUT);
  
  Serial.begin(115200);
  setup_wifi();
  
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Leer estado del sensor
  int currentState = digitalRead(PIN_SENSOR);
  
  // Detección de movimiento (flanco ascendente)
  if (currentState == HIGH && lastState == LOW) {
    passengerCount++;
    digitalWrite(PIN_LED, HIGH);
    
    // Mostrar en serial
    Serial.print("Movimiento detectado! Contador: ");
    Serial.println(passengerCount);
    
    // Enviar mensaje MQTT inmediatamente al detectar movimiento
    sendMQTTMessage();
    lastSendTime = millis();
  } 
  else if (currentState == LOW && lastState == HIGH) {
    digitalWrite(PIN_LED, LOW);
  }
  
  // Actualizar último estado
  lastState = currentState;
  
  // Envío periódico para asegurar sincronización
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime > SEND_INTERVAL) {
    sendMQTTMessage();
    lastSendTime = currentTime;
  }
  
  delay(100);  // Pequeña pausa para estabilidad
}
