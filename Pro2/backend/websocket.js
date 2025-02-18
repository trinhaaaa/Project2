const WebSocket = require('ws');
const mysql = require('mysql');

function startWebSocket() {
    // Kết nối MySQL
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "food"
    });

    db.connect(err => {
        if (err) {
            console.error(" Error connecting to MySQL:", err);
            return;
        }
        console.log("Connected to MySQL database.");
    });

    // Tạo WebSocket server
    const wss = new WebSocket.Server({ port: 8080 });

    // Lưu trạng thái nguyên liệu để tránh cập nhật dư thừa
    let lastQuantities = {};

    wss.on("connection", ws => {
        console.log("New client connected.");

        ws.on("message", message => {
            console.log(" Received:", message);
            try {
                const data = JSON.parse(message);

                if (data.sensor && data.id && data.quantity !== undefined) {
                    const ingredientId = data.id;
                    const newQuantity = parseFloat(data.quantity);  // Sửa từ weight → quantity

                    // Chỉ cập nhật nếu trọng lượng thay đổi > 10g
                    if (!lastQuantities[ingredientId] || Math.abs(lastQuantities[ingredientId] - newQuantity) > 0.01) {
                        const sql = "UPDATE ingredients SET quantity = ? WHERE id = ?";
                        db.query(sql, [newQuantity, ingredientId], (err, result) => {
                            if (err) {
                                console.error(" Database error:", err);
                                return;
                            }
                            console.log(` Updated ingredient ${ingredientId} with quantity ${newQuantity}`);
                        });

                        lastQuantities[ingredientId] = newQuantity; // Cập nhật trạng thái

                        // Phản hồi về ESP32
                        ws.send(JSON.stringify({ status: "success", id: ingredientId, quantity: newQuantity }));
                    } else {
                        console.log(`⚠ Skipping update for ingredient ${ingredientId}, change too small.`);
                    }
                }
            } catch (err) {
                console.error(" Invalid JSON:", err);
            }
        });

        ws.on("close", () => {
            console.log(" Client disconnected.");
        });

        ws.on("error", err => {
            console.error(" WebSocket error:", err);
        });
    });

    console.log("WebSocket server running on ws://localhost:8080");
}

module.exports = startWebSocket;
