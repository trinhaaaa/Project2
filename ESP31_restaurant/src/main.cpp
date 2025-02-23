#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <HX711.h>


const char* ssid = "Ha";
const char* password = "0365372229";
const char* server = "192.168.1.7";  
const int port = 5000;

#define DOUT1  4
#define CLK1   5

HX711 scale1;
WebSocketsClient webSocket;
bool isConnected = false;
float scaleFactor = -471.497; 
const int id = 1;  
float lastSentWeight = -1.0;  

// Xử lý sự kiện WebSocket
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println(" WebSocket Connected");
            isConnected = true;
            webSocket.sendTXT("{\"message\": \"ESP32 connected\"}");
            break;
        case WStype_DISCONNECTED:
            Serial.println(" WebSocket Disconnected");
            isConnected = false;
            break;
        case WStype_TEXT:
            Serial.print(" Server Response: ");
            Serial.println((char*)payload);
            break;
    }
}

// Kết nối WiFi
void connectWiFi() {
    Serial.println("Kết nối WiFi...");
    WiFi.begin(ssid, password);
    int retries = 0;

    while (WiFi.status() != WL_CONNECTED && retries < 15) {
        delay(1000);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nKết nối WiFi thành công!");
    } else {
        Serial.println("\nWiFi thất bại, khởi động lại ESP32...");
        ESP.restart();
    }
}

// Kết nối WebSocket
void connectWebSocket() {
    Serial.println("Kết nối WebSocket...");
    webSocket.begin(server, port, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000); 
}

// Khởi tạo Load Cell
void initializeScale() {
    Serial.println("Khởi động Load Cell...");
    scale1.set_scale(scaleFactor);
    scale1.tare();  // Đặt cân về 0
    Serial.println("Cân đã sẵn sàng.");
}

void setup() {
    Serial.begin(115200);
    
    scale1.begin(DOUT1, CLK1);
    initializeScale();

    connectWiFi();
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());

    connectWebSocket();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi mất kết nối, thử kết nối lại...");
        connectWiFi();
    }

    if (!isConnected) {
        Serial.println("WebSocket mất kết nối, thử kết nối lại...");
        connectWebSocket();
    }

    // Đọc dữ liệu từ Load Cell
    float weight1 = scale1.get_units(10);

    if (abs(weight1) < 1.0) {  
        weight1 = 0.00;
    }

    Serial.print("Cân nặng: "); 
    Serial.print(weight1, 2); 
    Serial.println(" g");

    // Chỉ gửi nếu cân nặng thay đổi đáng kể (> 1g)
    if (isConnected && abs(lastSentWeight - weight1) > 1.0) {
        String jsonData = "{\"id\": " + String(id) + ", \"quantity\": " + String(weight1, 2) + "}";
        webSocket.sendTXT(jsonData);
        Serial.println("Đã gửi dữ liệu WebSocket!");

        lastSentWeight = weight1;  
    } 

    delay(2000);
}
