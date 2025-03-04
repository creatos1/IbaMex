
/*
 * ESP32 Contador de Pasajeros con Comunicación MQTT
 * 
 * Este código implementa un contador de pasajeros para autobuses usando ESP32.
 * Utiliza sensores PIR para detectar entradas y salidas de pasajeros y envía
 * la información a través de MQTT a una aplicación móvil.
 * 
 * Actualizado para mejor compatibilidad con el broker HiveMQ público.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ===== CONFIGURACIÓN WIFI - EDITAR =====
const char* ssid = "TuRedWiFi";        // CAMBIAR: nombre de tu red WiFi
const char* password = "TuContraseña";  // CAMBIAR: contraseña de tu red WiFi

// ===== CONFIGURACIÓN MQTT =====
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;  // Puerto estándar para MQTT (sin SSL)
const char* mqtt_client_id = "ESP32_BUS101";  // CAMBIAR: ID único para cada ESP32
const char* mqtt_count_topic = "ibamex/bus/passenger/count";
const char* mqtt_status_topic = "ibamex/bus/status";
const char* mqtt_username = ""; // OPCIONAL: dejar en blanco si no se usa
const char* mqtt_password = ""; // OPCIONAL: dejar en blanco si no se usa

// ===== INFORMACIÓN DEL AUTOBÚS - EDITAR =====
const char* bus_id = "BUS101";       // CAMBIAR: ID único del autobús
const char* route_id = "R1-Centro";  // CAMBIAR: ID de la ruta

// ===== PINES PARA SENSORES =====
const int pinPIR_entrada = 13;  // Sensor que detecta entrada de pasajeros
const int pinPIR_salida = 14;   // Sensor que detecta salida de pasajeros
const int pinLED = 2;           // LED integrado en ESP32
const int pinBuzzer = 12;       // Buzzer para notificación audible (opcional)

// ===== VARIABLES GLOBALES =====
int contadorPasajeros = 0;      // Pasajeros actuales en el autobús
int totalPasajeros = 0;         // Total de pasajeros detectados
bool estadoEntrada = false;     // Estado actual del sensor de entrada
bool estadoSalida = false;      // Estado actual del sensor de salida
bool ultimoEstadoEntrada = false; // Estado anterior del sensor de entrada
bool ultimoEstadoSalida = false;  // Estado anterior del sensor de salida

// ===== TEMPORIZADORES =====
unsigned long ultimoEnvio = 0;            // Último envío de estado
unsigned long ultimaReconexion = 0;       // Última reconexión a MQTT
unsigned long ultimaActualizacionBateria = 0; // Última actualización de batería
const long intervaloEnvio = 30000;        // Enviar cada 30 segundos
const long intervaloReconexion = 5000;    // Intentar reconexión cada 5 segundos
const long intervaloBateria = 60000;      // Actualizar batería cada 60 segundos
const long intervaloDebounce = 500;       // Anti-rebote para sensores

// ===== SIMULACIÓN DE BATERÍA =====
int nivelBateria = 100;

// ===== CLIENTE WIFI Y MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== FUNCIONES =====

// Configuración inicial
void setup() {
  // Inicializar puerto serial
  Serial.begin(115200);
  Serial.println("\n\n=== Sistema de conteo de pasajeros IbaMex ===");

  // Configurar pines
  pinMode(pinPIR_entrada, INPUT);
  pinMode(pinPIR_salida, INPUT);
  pinMode(pinLED, OUTPUT);
  if (pinBuzzer > 0) {
    pinMode(pinBuzzer, OUTPUT);
  }

  // Conectar a WiFi
  setupWifi();

  // Configurar servidor MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // Intentar conexión inicial
  reconectarMQTT();

  // Enviar estado inicial
  if (client.connected()) {
    enviarEstado();
    digitalWrite(pinLED, HIGH);  // LED encendido cuando está conectado
  }
}

// Bucle principal
void loop() {
  unsigned long tiempoActual = millis();
  
  // Gestionar conexión MQTT
  if (!client.connected()) {
    if (tiempoActual - ultimaReconexion >= intervaloReconexion) {
      ultimaReconexion = tiempoActual;
      reconectarMQTT();
    }
  } else {
    client.loop();
    
    // Leer sensores
    leerSensores();
    
    // Enviar datos periódicamente
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
}

// Configuración de WiFi
void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);  // Modo estación
  WiFi.begin(ssid, password);

  // Parpadear LED durante la conexión
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    digitalWrite(pinLED, !digitalRead(pinLED));
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(pinLED, HIGH);  // LED encendido cuando está conectado
    Serial.println("");
    Serial.println("WiFi conectado");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("No se pudo conectar a WiFi. Reintentando en el loop...");
    digitalWrite(pinLED, LOW);
  }
}

// Función para procesar mensajes MQTT recibidos
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensaje recibido [");
  Serial.print(topic);
  Serial.print("] ");
  
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  
  Serial.println(message);
  
  // Aquí puedes agregar lógica para responder a comandos
  // Por ejemplo, si recibes un mensaje para reiniciar contadores
}

// Función para conectar/reconectar a MQTT
void reconectarMQTT() {
  // Verificar WiFi primero
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Reconectando...");
    setupWifi();
    return;
  }
  
  // Intentar conexión MQTT
  if (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    
    // Crear ID de cliente único basado en la dirección MAC
    String clientId = mqtt_client_id;
    clientId += "-";
    clientId += String(random(0xffff), HEX);
    
    // Intentar conectar con o sin credenciales
    bool conectado = false;
    if (strlen(mqtt_username) > 0) {
      conectado = client.connect(clientId.c_str(), mqtt_username, mqtt_password);
    } else {
      conectado = client.connect(clientId.c_str());
    }
    
    if (conectado) {
      Serial.println("conectado");
      
      // Suscribirse a temas relevantes
      // Por ejemplo, si quieres recibir comandos:
      // client.subscribe("ibamex/bus/command");
      
      // Enviar mensaje de conexión
      enviarEstado();
      
      // Indicación visual
      digitalWrite(pinLED, HIGH);
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en el próximo ciclo");
      
      // Indicación visual
      digitalWrite(pinLED, LOW);
    }
  }
}

// Leer sensores y detectar pasajeros
void leerSensores() {
  static unsigned long ultimaDeteccionEntrada = 0;
  static unsigned long ultimaDeteccionSalida = 0;
  
  unsigned long tiempoActual = millis();
  
  // Leer estado actual de sensores PIR
  estadoEntrada = digitalRead(pinPIR_entrada);
  estadoSalida = digitalRead(pinPIR_salida);

  // Detectar cambio en sensor de entrada (con debounce)
  if (estadoEntrada && !ultimoEstadoEntrada && (tiempoActual - ultimaDeteccionEntrada > intervaloDebounce)) {
    ultimaDeteccionEntrada = tiempoActual;
    contadorPasajeros++;
    totalPasajeros++;
    notificarDeteccion();
    enviarConteo(1);  // Enviar incremento de 1
  }

  // Detectar cambio en sensor de salida (con debounce)
  if (estadoSalida && !ultimoEstadoSalida && (tiempoActual - ultimaDeteccionSalida > intervaloDebounce)) {
    ultimaDeteccionSalida = tiempoActual;
    contadorPasajeros = max(0, contadorPasajeros - 1);  // Evitar números negativos
    notificarDeteccion();
    enviarConteo(-1);  // Enviar decremento de 1
  }

  // Guardar último estado
  ultimoEstadoEntrada = estadoEntrada;
  ultimoEstadoSalida = estadoSalida;
}

// Notificación visual y auditiva de detección
void notificarDeteccion() {
  // Encender LED
  digitalWrite(pinLED, HIGH);
  
  // Activar buzzer si está disponible
  if (pinBuzzer > 0) {
    digitalWrite(pinBuzzer, HIGH);
    delay(50);
    digitalWrite(pinBuzzer, LOW);
  }
  
  delay(50);
  digitalWrite(pinLED, LOW);

  // Imprimir información en puerto serial
  Serial.print("Pasajeros actuales: ");
  Serial.print(contadorPasajeros);
  Serial.print(" | Total pasajeros: ");
  Serial.println(totalPasajeros);
}

// Enviar actualización de conteo al servidor MQTT
void enviarConteo(int incremento) {
  if (!client.connected()) return;

  // Crear objeto JSON para el mensaje
  StaticJsonDocument<200> doc;
  doc["busId"] = bus_id;
  doc["routeId"] = route_id;
  doc["count"] = incremento;          // Cambio en el conteo
  doc["totalPassengers"] = totalPasajeros;  // Total acumulado
  doc["currentPassengers"] = contadorPasajeros;  // Ocupación actual

  // Convertir a string
  char buffer[256];
  serializeJson(doc, buffer);

  // Publicar mensaje
  bool exito = client.publish(mqtt_count_topic, buffer);
  
  if (exito) {
    Serial.print("Conteo publicado: ");
    Serial.println(buffer);
  } else {
    Serial.println("Error al publicar conteo MQTT");
  }
}

// Enviar estado completo al servidor MQTT
void enviarEstado() {
  if (!client.connected()) return;

  // Crear objeto JSON para el mensaje de estado
  StaticJsonDocument<256> doc;
  doc["busId"] = bus_id;
  doc["routeId"] = route_id;
  doc["batteryLevel"] = nivelBateria;
  doc["status"] = "active";
  doc["currentPassengers"] = contadorPasajeros;
  doc["totalPassengers"] = totalPasajeros;
  doc["timestamp"] = millis() / 1000; // Tiempo desde inicio en segundos
  doc["rssi"] = WiFi.RSSI(); // Fuerza de señal WiFi

  // Convertir a string
  char buffer[256];
  serializeJson(doc, buffer);

  // Publicar mensaje
  bool exito = client.publish(mqtt_status_topic, buffer);
  
  if (exito) {
    Serial.print("Estado enviado: ");
    Serial.println(buffer);
  } else {
    Serial.println("Error al publicar estado MQTT");
  }
}

// Simular consumo de batería
void actualizarBateria() {
  // Reducción gradual de batería
  if (nivelBateria > 0) {
    nivelBateria -= random(0, 2);  // Reducir entre 0 y 1%
    if (nivelBateria < 0) nivelBateria = 0;
  }
  
  // Si la batería está muy baja, notificar
  if (nivelBateria < 20) {
    // Parpadeo especial para batería baja
    for (int i = 0; i < 3; i++) {
      digitalWrite(pinLED, HIGH);
      delay(100);
      digitalWrite(pinLED, LOW);
      delay(100);
    }
  }
}
