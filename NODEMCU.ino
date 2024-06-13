#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "Hunterz";
const char* password = "21632789"; // 21632789
const int serverPort = 80; // Use 443 for HTTPS
const char* serverUrl = "https://192.168.1.74"; // Change to your server's HTTPS URL

const int relayPin = D1;         // Pin connected to the relay module for opening

ESP8266WebServer server(serverPort);

void handleRequest() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "Signal received");
  Serial.println("HTTP signal received");

  digitalWrite(relayPin, LOW);
  delay(300);
  digitalWrite(relayPin, HIGH);
  delay(17000); // 12 seconds waiting time after gate opening
  digitalWrite(relayPin, LOW);
  delay(300);
  digitalWrite(relayPin, HIGH);
}

void setup() {
  pinMode(relayPin, OUTPUT);
 

  digitalWrite(relayPin, HIGH);
       // Ensure relay is initially off
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  Serial.println("IP address: " + WiFi.localIP().toString());

  server.on("/signal", handleRequest);
  server.begin();

}

void loop() {
  server.handleClient(); // Handle client requests
}
