#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Arduino.h>



const char* ssid = "Ha";
const char* password = "0365372229";
const char* server = "192.168.1.7";  
const int port = 8080;

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println("WebSocket Connected!");
            break;
        case WStype_DISCONNECTED:
            Serial.println("WebSocket Disconnected!");
            break;
        case WStype_TEXT:
            Serial.printf("Received: %s\n", payload);
            break;
    }
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");

    webSocket.begin(server, port, "/ws");
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop();  

    if (WiFi.status() == WL_CONNECTED) {
        float fake_weight = random(100, 500) / 100.0;  
        String jsonData = "{\"ingredient_id\": 1, \"quantity\": " + String(fake_weight, 2) + "}";

        Serial.println("Sending: " + jsonData);
        webSocket.sendTXT(jsonData);
    } else {
        Serial.println("WiFi Disconnected! Reconnecting...");
        WiFi.reconnect();
    }

    delay(5000);
}
