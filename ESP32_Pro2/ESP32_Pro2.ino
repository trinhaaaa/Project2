#include <Arduino.h>
#include "HX711.h"
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Ha";
const char* password = "0365372229";

// WebSocket server
const char* websocket_server_host = "192.168.1.9"; 
const uint16_t websocket_server_port = 5678;

// WebSocket client
WebSocketsClient webSocket;

// Load-cell pins
#define DOUT1 4
#define CLK1 5

#define DOUT2 25
#define CLK2 26


#define DOUT3 18
#define CLK3 19

HX711 scale1;
HX711 scale2;
HX711 scale3;

// Lưu giá trị cũ để tránh gửi dữ liệu không cần thiết
float lastWeight1 = -1;
float lastWeight2 = -1;
float lastWeight3 = -1;

// Kết nối WiFi
void connectWiFi() {
    WiFi.disconnect(true);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    Serial.print("\nĐang kết nối WiFi: ");
    Serial.println(ssid);

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 30) {
        delay(500);
        Serial.print(".");
        retry++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Đã kết nối WiFi!");
        Serial.print("Địa chỉ IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("Không thể kết nối WiFi.");
        Serial.println("Đợi 10s rồi thử lại...");
        delay(10000);
        connectWiFi();  // Không reset, chỉ thử lại
    }
}

// Xử lý sự kiện WebSocket
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket mất kết nối! Đang thử lại...");
            break;
        case WStype_CONNECTED:
            Serial.println("WebSocket kết nối thành công.");
            break;
        case WStype_TEXT:
            Serial.printf("Nhận dữ liệu từ server: %s\n", payload);
            break;
        case WStype_BIN:
            Serial.println("Nhận dữ liệu nhị phân.");
            break;
        default:
            break;
    }
}

void setup() {
    Serial.begin(115200);

    connectWiFi();

    // Chỉ kết nối WebSocket nếu WiFi đã kết nối thành công
    if (WiFi.status() == WL_CONNECTED) {
        webSocket.begin(websocket_server_host, websocket_server_port, "/");
        webSocket.onEvent(webSocketEvent);
        webSocket.setReconnectInterval(5000);
        Serial.println("WebSocket đang kết nối...");
    } else {
        Serial.println("Không có WiFi, bỏ qua WebSocket.");
    }

    scale1.begin(DOUT1, CLK1);
    scale1.set_scale(-471.497);
    scale1.tare();

    scale2.begin(DOUT2, CLK2);
    scale2.set_scale(-471.497);
    scale2.tare();

    scale3.begin(DOUT3, CLK3);
    scale3.set_scale(-1279.124);
    scale3.tare();

    Serial.println("Load-cell đã khởi tạo.");
}

// Hàm đọc giá trị từ load-cell (nếu chưa sẵn sàng, giữ giá trị cũ)
float getWeight(HX711 &scale, float lastWeight) {
    if (scale.is_ready()) {
        float weight = scale.get_units(5);
        if (weight < 0) weight = 0; // Giới hạn giá trị hợp lệ
        return round(weight * 100) / 100.0; // Làm tròn 2 số thập phân
    }
    return lastWeight; // Nếu không đọc được, giữ nguyên giá trị cũ
}

void loop() {
    // Kiểm tra kết nối WiFi
    static unsigned long lastReconnectAttempt = 0;
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 10000) {  // Thử lại mỗi 10 giây
            Serial.println("Mất kết nối WiFi! Đang thử lại...");
            connectWiFi();
            lastReconnectAttempt = now;
        }
    } else {
        webSocket.loop();
    }

    static unsigned long lastSendTime = 0;
    if (millis() - lastSendTime > 2000) {  // Cứ 2 giây gửi dữ liệu
        lastSendTime = millis();
        delay(100); // Chờ load-cell ổn định

        float weight1 = getWeight(scale1, lastWeight1);
        float weight2 = getWeight(scale2, lastWeight2);
        float weight3 = getWeight(scale3, lastWeight3);

        // Chỉ gửi nếu có sự thay đổi đáng kể
        if (abs(weight1 - lastWeight1) > 0.01 || abs(weight2 - lastWeight2) > 0.01 || abs(weight3 - lastWeight3) > 0.01) {
            lastWeight1 = weight1;
            lastWeight2 = weight2;
            lastWeight3 = weight3;

            // Tạo JSON để gửi cả 3 giá trị một lúc
            StaticJsonDocument<200> doc;
            JsonArray data = doc.createNestedArray("scales");

            JsonObject scale1Obj = data.createNestedObject();
            scale1Obj["id"] = 1;
            scale1Obj["quantity"] = weight1;

            JsonObject scale2Obj = data.createNestedObject();
            scale2Obj["id"] = 2;
            scale2Obj["quantity"] = weight2;

            JsonObject scale3Obj = data.createNestedObject();
            scale3Obj["id"] = 3;
            scale3Obj["quantity"] = weight3;

            char jsonBuffer[200];
            serializeJson(doc, jsonBuffer);

            Serial.println("Gửi dữ liệu: " + String(jsonBuffer));
            webSocket.sendTXT(jsonBuffer);
        }
    }
}


// #include <Arduino.h>
// #include "HX711.h"
// #include <WiFi.h>
// #include <WebSocketsClient.h>
// #include <ArduinoJson.h>

// // WiFi credentials
// const char* ssid = "EIU STUDENT/GUEST 1";
// const char* password = "";

// // WebSocket server
// const char* websocket_server_host = "10.30.192.161";
// const uint16_t websocket_server_port = 5678;

// // WebSocket client
// WebSocketsClient webSocket;

// // Load-cell pins
// #define DOUT1 4
// #define CLK1 5

// #define DOUT2 17
// #define CLK2 16

// #define DOUT3 18
// #define CLK3 19

// HX711 scale1;
// HX711 scale2;
// HX711 scale3;

// // Lưu giá trị cũ để tránh gửi dữ liệu không cần thiết
// float lastWeight1 = -1;
// float lastWeight2 = -1;
// float lastWeight3 = -1;

// void connectWiFi() {
//   WiFi.disconnect(true);
//   WiFi.mode(WIFI_STA);
//   WiFi.begin(ssid, password);

//   Serial.print("\nĐang kết nối WiFi: ");
//   Serial.println(ssid);

//   int retry = 0;
//   while (WiFi.status() != WL_CONNECTED && retry < 30) {
//     delay(500);
//     Serial.print(".");
//     retry++;
//   }

//   Serial.println();

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("Đã kết nối WiFi!");
//     Serial.print("Địa chỉ IP: ");
//     Serial.println(WiFi.localIP());
//   } else {
//     Serial.println("Không thể kết nối WiFi.");
//     Serial.println("Đợi 10s rồi thử lại...");
//     delay(10000);
//     connectWiFi();  // Không reset, chỉ thử lại
//   }
// }

// void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
//   switch (type) {
//     case WStype_DISCONNECTED:
//       Serial.println("WebSocket mất kết nối! Đang thử lại...");
//       break;
//     case WStype_CONNECTED:
//       Serial.println("WebSocket kết nối thành công.");
//       break;
//     case WStype_TEXT:
//       Serial.printf("Nhận dữ liệu từ server: %s\n", payload);
//       break;
//     case WStype_BIN:
//       Serial.println("Nhận dữ liệu nhị phân.");
//       break;
//     default:
//       break;
//   }
// }

// void setup() {
//   Serial.begin(115200);

//   connectWiFi();

//   // Chỉ kết nối WebSocket nếu WiFi đã kết nối thành công
//   if (WiFi.status() == WL_CONNECTED) {
//     webSocket.begin(websocket_server_host, websocket_server_port, "/");
//     webSocket.onEvent(webSocketEvent);
//     webSocket.setReconnectInterval(5000);
//     Serial.println("WebSocket đang kết nối...");
//   } else {
//     Serial.println("Không có WiFi, bỏ qua WebSocket.");
//   }

//   scale1.begin(DOUT1, CLK1);
//   scale1.set_scale(-471.497);
//   scale1.tare();

//   scale2.begin(DOUT2, CLK2);
//   scale2.set_scale(-471.497);
//   scale2.tare();

//   scale3.begin(DOUT3, CLK3);
//   scale3.set_scale(-1279.124);
//   scale3.tare();

//   Serial.println("Load-cell đã khởi tạo.");
// }

// void loop() {
//   // Chỉ chạy WebSocket nếu WiFi đang kết nối
//   if (WiFi.status() == WL_CONNECTED) {
//     webSocket.loop();
//   } else {
//     Serial.println("Mất kết nối WiFi! Đang thử lại...");
//     connectWiFi();  // Thử kết nối lại mà không cần reset ESP32
//   }

//   static unsigned long lastSendTime = 0;
//   if (millis() - lastSendTime > 5000) {  // Cứ 5 giây gửi dữ liệu
//     lastSendTime = millis();

//     //Sinh dữ liệu ngẫu nhiên
//     float weight1 = random(5, 550);
//     float weight2 = random(5, 550);
//     float weight3 = random(5, 550);


//     // Làm tròn giá trị đến 2 số thập phân
//     weight1 = round(weight1 * 100) / 100.0;
//     weight2 = round(weight2 * 100) / 100.0;
//     weight3 = round(weight3 * 100) / 100.0;

//     // Chỉ gửi nếu có sự thay đổi đáng kể
//     if (abs(weight1 - lastWeight1) > 0.01 || abs(weight2 - lastWeight2) > 0.01 || abs(weight3 - lastWeight3) > 0.01) {
//       lastWeight1 = weight1;
//       lastWeight2 = weight2;
//       lastWeight3 = weight3;

//       // Tạo JSON để gửi cả 3 giá trị một lúc
//       StaticJsonDocument<200> doc;
//       JsonArray data = doc.createNestedArray("scales");

//       JsonObject scale1Obj = data.createNestedObject();
//       scale1Obj["id"] = 1;
//       scale1Obj["quantity"] = weight1;

//       JsonObject scale2Obj = data.createNestedObject();
//       scale2Obj["id"] = 2;
//       scale2Obj["quantity"] = weight2;

//       JsonObject scale3Obj = data.createNestedObject();
//       scale3Obj["id"] = 3;
//       scale3Obj["quantity"] = weight3;

//       char jsonBuffer[200];
//       serializeJson(doc, jsonBuffer);

//       Serial.println("Gửi dữ liệu: " + String(jsonBuffer));
//       webSocket.sendTXT(jsonBuffer);
//     }
//   }
// }
