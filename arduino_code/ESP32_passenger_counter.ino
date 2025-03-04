/*
 * ESP32 Passenger Counter with MQTT Communication
 * 
 * Este código implementa un contador de pasajeros para autobuses usando un ESP32.
 * Utiliza sensores PIR para detectar entradas y salidas de pasajeros y envía
 * la información a través de MQTT a una aplicación móvil.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuración de WiFi - EDITA ESTOS VALORES
const char* ssid = "TuRedWiFi";        // CAMBIAR: Nombre de tu red WiFi
const char* password = "TuContraseña";  // CAMBIAR: Contraseña de tu red WiFi

// Configuración de MQTT
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;  // Puerto estándar para MQTT (8884 para WSS)
const char* mqtt_client_id = "ESP32_BUS101";  // CAMBIAR: ID único para cada dispositivo
const char* mqtt_count_topic = "ibamex/bus/passenger/count";
const char* mqtt_status_topic = "ibamex/bus/status";

// Información del autobús - EDITA ESTOS VALORES
const char* bus_id = "BUS101";       // CAMBIAR: ID único del autobús
const char* route_id = "R1-Centro";  // CAMBIAR: ID de la ruta

// Pines para sensores PIR (Passive Infrared)
const int pinPIR_entrada = 13;  // Sensor que detecta entrada de pasajeros
const int pinPIR_salida = 14;   // Sensor que detecta salida de pasajeros

// LED y Buzzer para indicación
const int pinLED = 2;           // LED integrado en ESP32
const int pinBuzzer = 12;       // Buzzer para notificación audible

// Variables para contar pasajeros
int contadorPasajeros = 0;
int totalPasajeros = 0;
bool estadoEntrada = false;
bool estadoSalida = false;
bool ultimoEstadoEntrada = false;
bool ultimoEstadoSalida = false;

// Temporizador para envío periódico de datos
unsigned long ultimoEnvio = 0;
const long intervaloEnvio = 30000;  // Enviar cada 30 segundos

// Variables para simulación de batería
int nivelBateria = 100;
unsigned long ultimaActualizacionBateria = 0;
const long intervaloBateria = 60000;  // Actualizar batería cada 60 segundos

// Cliente WiFi y MQTT
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  // Inicializar puerto serial
  Serial.begin(115200);

  // Configurar pines
  pinMode(pinPIR_entrada, INPUT);
  pinMode(pinPIR_salida, INPUT);
  pinMode(pinLED, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);

  // Conectar a WiFi
  setupWifi();

  // Configurar servidor MQTT
  client.setServer(mqtt_server, mqtt_port);

  // Mensaje inicial
  Serial.println("Sistema de conteo de pasajeros iniciado");

  // Enviar estado inicial
  if (client.connected()) {
    enviarEstado();
  }
}

void loop() {
  // Reconectar si es necesario
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Leer sensores
  leerSensores();

  // Enviar datos periódicamente
  unsigned long tiempoActual = millis();
  if (tiempoActual - ultimoEnvio >= intervaloEnvio) {
    ultimoEnvio = tiempoActual;
    enviarEstado();
  }

  // Actualizar simulación de batería
  if (tiempoActual - ultimaActualizacionBateria >= intervaloBateria) {
    ultimaActualizacionBateria = tiempoActual;
    actualizarBateria();
  }
}

void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(pinLED, !digitalRead(pinLED));  // Parpadeo mientras conecta
    delay(500);
    Serial.print(".");
  }

  digitalWrite(pinLED, HIGH);  // LED encendido cuando está conectado
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Bucle hasta reconectar
  int intentos = 0;
  while (!client.connected() && intentos < 5) {
    Serial.print("Intentando conexión MQTT...");
    intentos++;

    // Intentar conectar
    if (client.connect(mqtt_client_id)) {
      Serial.println("conectado");

      // Enviar mensaje de conexión
      enviarEstado();
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentando de nuevo en 5 segundos");

      // Esperar antes de reintentar
      digitalWrite(pinLED, LOW);
      delay(5000);
    }
  }
}

void leerSensores() {
  // Leer estado actual de sensores PIR
  estadoEntrada = digitalRead(pinPIR_entrada);
  estadoSalida = digitalRead(pinPIR_salida);

  // Detectar cambio en sensor de entrada (flanco ascendente)
  if (estadoEntrada && !ultimoEstadoEntrada) {
    contadorPasajeros++;
    totalPasajeros++;
    notificarDeteccion();
    enviarConteo(1);  // Enviar incremento de 1
  }

  // Detectar cambio en sensor de salida (flanco ascendente)
  if (estadoSalida && !ultimoEstadoSalida) {
    contadorPasajeros = max(0, contadorPasajeros - 1);  // Evitar números negativos
    notificarDeteccion();
    enviarConteo(-1);  // Enviar decremento de 1
  }

  // Guardar último estado
  ultimoEstadoEntrada = estadoEntrada;
  ultimoEstadoSalida = estadoSalida;
}

void notificarDeteccion() {
  // Notificación visual y auditiva de detección
  digitalWrite(pinLED, HIGH);
  if (pinBuzzer > 0) {
    digitalWrite(pinBuzzer, HIGH);
    delay(100);
    digitalWrite(pinBuzzer, LOW);
  }
  delay(100);
  digitalWrite(pinLED, LOW);

  // Imprimir información en puerto serial
  Serial.print("Pasajeros actuales: ");
  Serial.print(contadorPasajeros);
  Serial.print(" | Total pasajeros: ");
  Serial.println(totalPasajeros);
}

void enviarConteo(int incremento) {
  if (!client.connected()) return;

  // Crear objeto JSON para el mensaje
  StaticJsonDocument<200> doc;
  doc["busId"] = bus_id;
  doc["routeId"] = route_id;
  doc["count"] = incremento;  // Enviar el incremento/decremento

  // Convertir a string
  char buffer[200];
  serializeJson(doc, buffer);

  // Publicar mensaje
  client.publish(mqtt_count_topic, buffer);
  Serial.print("Publicado: ");
  Serial.println(buffer);
}

void enviarEstado() {
  if (!client.connected()) return;

  // Crear objeto JSON para el mensaje de estado
  StaticJsonDocument<200> doc;
  doc["busId"] = bus_id;
  doc["routeId"] = route_id;
  doc["batteryLevel"] = nivelBateria;
  doc["status"] = "active";
  doc["currentPassengers"] = contadorPasajeros;
  doc["totalPassengers"] = totalPasajeros;

  // Convertir a string
  char buffer[200];
  serializeJson(doc, buffer);

  // Publicar mensaje
  client.publish(mqtt_status_topic, buffer);
  Serial.print("Estado enviado: ");
  Serial.println(buffer);
}

void actualizarBateria() {
  // Simular consumo de batería
  if (nivelBateria > 0) {
    nivelBateria -= random(0, 2);  // Reducir entre 0 y 1%
    if (nivelBateria < 0) nivelBateria = 0;
  }
}