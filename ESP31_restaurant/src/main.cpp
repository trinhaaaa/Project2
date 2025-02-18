#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Arduino.h>
#include <HX711.h>

// WiFi thông tin
const char* ssid = "Ha";            
const char* password = "0365372229"; 
const char* server = "192.168.1.7";  
const int port = 8080;


#define DOUT1  4
#define CLK1   5

HX711 scale1;
WebSocketsClient webSocket;
bool isConnected = false;
float scaleFactor = -471.497; 

int id = 1;  
float lastQuantity = -1;  
unsigned long lastUpdateTime = 0; 
const unsigned long updateInterval = 5000; 

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println(" WebSocket Connected!");
            isConnected = true;
            webSocket.sendTXT("{\"message\": \"ESP32 connected\"}");
            break;
        case WStype_DISCONNECTED:
            Serial.println(" WebSocket Disconnected! Reconnecting...");
            isConnected = false;
            break;
        case WStype_TEXT:
            Serial.print("Received from server: ");
            Serial.println((char*)payload);
            break;
    }
}

void connectWiFi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    int retries = 0;

    while (WiFi.status() != WL_CONNECTED && retries < 10) {
        delay(1000);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Connected!");
        Serial.print(" ESP32 IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n WiFi Connection Failed, restarting...");
        ESP.restart();
    }
}

void connectWebSocket() {
    Serial.println("Connecting to WebSocket...");
    webSocket.begin(server, port, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void initializeScale() {
    Serial.println("Khởi động Load Cell...");
    scale1.set_scale(scaleFactor);  
    scale1.tare(); 
    Serial.println("Cân đã sẵn sàng.");
}

void setup() {
    Serial.begin(115200);
    
    scale1.begin(DOUT1, CLK1);
    initializeScale();

    connectWiFi();
    connectWebSocket();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi Mất kết nối! Đang thử lại...");
        connectWiFi();
    }

    if (!isConnected) {
        Serial.println("WebSocket Mất kết nối! Đang thử lại...");
        connectWebSocket();
    }

    float quantity = scale1.get_units(10); // Đọc trung bình 10 lần để giảm nhiễu

    if (abs(quantity) < 1.0) {  
        quantity = 0.00; // Nếu nhỏ hơn 1g, coi như 0
    }

    unsigned long currentTime = millis();

    // Chỉ gửi dữ liệu nếu thay đổi > 10g hoặc sau 5 giây
    if (abs(quantity - lastQuantity) > 0.01 || (currentTime - lastUpdateTime) > updateInterval) {
        Serial.print("Cân nặng: "); 
        Serial.print(quantity, 2); 
        Serial.println(" kg");

        if (isConnected) {
            // Thay "weight" thành "quantity" để đúng với database
            String jsonData = "{\"sensor\":1, \"id\":" + String(id) + ", \"quantity\":" + String(quantity, 2) + "}";
            webSocket.sendTXT(jsonData);
            Serial.println("📤 Sent to server: " + jsonData);
        }

        lastQuantity = quantity;
        lastUpdateTime = currentTime;
    }

    delay(500);
}
