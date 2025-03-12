#include <WiFi.h>
#include <WebServer.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
const char* ssid = "TU_REDE_WIFI";
const char* password = "TU_PASSWORD";

WebServer server(80);

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nIP address: ");
  Serial.println(WiFi.localIP());

  server.on("/data", HTTP_GET, []() {
    String response = "{\"temp\":25.3,\"hum\":60}";
    server.send(200, "application/json", response);
  });

  server.begin();
}

void loop() {
  server.handleClient();
}