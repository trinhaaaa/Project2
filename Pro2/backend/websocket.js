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
        console.log("Kết nối MySQL thành công!");
        return connection;
    } catch (err) {
        console.error("Lỗi kết nối MySQL:", err);
        return null;
    }
}

// Tạo WebSocket Server trên cổng 5000
const wss = new WebSocket.Server({ port: 5000 });

console.log("WebSocket server đang chạy trên ws://localhost:5000");

// Lưu giá trị cuối để tránh cập nhật dư thừa
let lastQuantities = {};

// Xử lý kết nối WebSocket từ ESP32
wss.on("connection", async (ws) => {
    console.log("ESP32 đã kết nối WebSocket.");
    ws.send(JSON.stringify({ status: "connected" }));

    // Kết nối đến MySQL
    const db = await connectDB();
    if (!db) {
        ws.send(JSON.stringify({ status: "error", message: "Không thể kết nối MySQL" }));
        return;
    }

    ws.on("message", async (message) => {
        console.log("Nhận dữ liệu từ ESP32:", message.toString());

        try {
            const data = JSON.parse(message);
            
            // Kiểm tra tính hợp lệ của dữ liệu
            if (typeof data.id !== "number" || typeof data.quantity === "undefined") {
                console.error("Dữ liệu không hợp lệ:", data);
                ws.send(JSON.stringify({ status: "error", message: "Dữ liệu không hợp lệ" }));
                return;
            }

            const ingredientId = data.id;
            const quantity = parseFloat(data.quantity);

            if (isNaN(quantity)) {
                console.error("Giá trị quantity không hợp lệ:", data.quantity);
                ws.send(JSON.stringify({ status: "error", message: "Số lượng không hợp lệ" }));
                return;
            }

            console.log(`Xử lý cập nhật: ID ${ingredientId}, Số lượng ${quantity} kg`);

            // Chỉ cập nhật nếu thay đổi đáng kể (> 0.01)
            if (!lastQuantities[ingredientId] || Math.abs(lastQuantities[ingredientId] - quantity) > 0.01) {
                try {
                    const sql = "UPDATE ingredients SET quantity = ? WHERE id = ?";
                    await db.execute(sql, [quantity, ingredientId]);

                    console.log(`Đã cập nhật nguyên liệu ID ${ingredientId} thành ${quantity} kg`);
                    lastQuantities[ingredientId] = quantity;

                    ws.send(JSON.stringify({ status: "success", id: ingredientId, quantity: quantity }));
                } catch (err) {
                    console.error("Lỗi MySQL:", err);
                    ws.send(JSON.stringify({ status: "error", message: "Lỗi cập nhật MySQL" }));
                }
            } else {
                console.log(`Bỏ qua cập nhật ID ${ingredientId}, thay đổi không đáng kể.`);
            }
        } catch (err) {
            console.error("Lỗi xử lý JSON:", err);
            console.error("Dữ liệu nhận được:", message.toString());
            ws.send(JSON.stringify({ status: "error", message: "Lỗi xử lý JSON" }));
        }
    });

    ws.on("close", () => console.log("ESP32 đã mất kết nối WebSocket."));
    ws.on("error", (err) => console.error("Lỗi WebSocket:", err));
});
