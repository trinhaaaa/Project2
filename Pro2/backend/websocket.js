const WebSocket = require("ws");
const mysql = require("mysql2/promise");

// Cấu hình kết nối MySQL
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "food",
};

// Hàm kết nối MySQL
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("✅ Kết nối MySQL thành công!");
        return connection;
    } catch (err) {
        console.error("❌ Lỗi kết nối MySQL:", err);
        return null;
    }
}

// Tạo WebSocket Server
const wss = new WebSocket.Server({ port: 5678 });
console.log("🌐 WebSocket server đang chạy trên ws://localhost:5678");

// Lưu danh sách các client (ESP32 & Frontend)
const clients = new Set();

// Lưu giá trị cuối để tránh cập nhật dư thừa
let lastQuantities = {};

// Xử lý kết nối từ ESP32 hoặc Frontend
wss.on("connection", async (ws) => {
    console.log("🔗 Client mới đã kết nối.");
    clients.add(ws);
    ws.send(JSON.stringify({ status: "connected" }));

    const db = await connectDB();
    if (!db) {
        ws.send(JSON.stringify({ status: "error", message: "Không thể kết nối MySQL" }));
        return;
    }

    ws.on("message", async (message) => {
        console.log("📩 Nhận dữ liệu từ ESP32:", message.toString());

        try {
            const data = JSON.parse(message);
            
            // Kiểm tra tính hợp lệ của dữ liệu
            if (!data.id || !("quantity" in data)) {
                console.error("🚨 Lỗi: JSON thiếu id hoặc quantity:", data);
                ws.send(JSON.stringify({ status: "error", message: "Dữ liệu không hợp lệ" }));
                return;
            }

            const ingredientId = data.id;
            const quantity = parseFloat(data.quantity);

            if (isNaN(quantity) || quantity < 0) {
                console.error("🚨 Lỗi: Giá trị quantity không hợp lệ:", data.quantity);
                ws.send(JSON.stringify({ status: "error", message: "Số lượng không hợp lệ" }));
                return;
            }

            console.log(`🔄 Cập nhật: ID ${ingredientId}, Số lượng ${quantity} kg`);

            // Khởi tạo giá trị ban đầu cho lastQuantities
            if (!(ingredientId in lastQuantities)) {
                lastQuantities[ingredientId] = -1; 
            }

            // Chỉ cập nhật nếu thay đổi đáng kể (> 0.01)
            if (Math.abs(lastQuantities[ingredientId] - quantity) > 0.01) {
                try {
                    const sql = "UPDATE ingredients SET quantity = ? WHERE id = ?";
                    await db.execute(sql, [quantity, ingredientId]);

                    console.log(`✅ Đã cập nhật nguyên liệu ID ${ingredientId} thành ${quantity} kg`);
                    lastQuantities[ingredientId] = quantity;

                    // Gửi dữ liệu cập nhật đến tất cả client (Frontend & ESP32)
                    const updateData = JSON.stringify({ status: "update", id: ingredientId, quantity: quantity });
                    clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(updateData);
                        }
                    });

                } catch (err) {
                    console.error("❌ Lỗi MySQL:", err);
                    ws.send(JSON.stringify({ status: "error", message: "Lỗi cập nhật MySQL" }));
                }
            } else {
                console.log(`⚠️ Bỏ qua cập nhật ID ${ingredientId}, thay đổi không đáng kể.`);
            }
        } catch (err) {
            console.error("❌ Lỗi xử lý JSON:", err);
            ws.send(JSON.stringify({ status: "error", message: "Lỗi xử lý JSON" }));
        }
    });

    ws.on("close", () => {
        console.log("⚠️ Client đã mất kết nối.");
        clients.delete(ws);
    });

    ws.on("error", (err) => console.error("❌ Lỗi WebSocket:", err));
});
