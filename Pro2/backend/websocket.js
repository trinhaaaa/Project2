const WebSocket = require("ws");
const mysql = require("mysql2/promise");

// Cấu hình database
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "food",
};

// Tạo WebSocket Server
const wss = new WebSocket.Server({ port: 5678 });
console.log("WebSocket Server đang chạy trên ws://localhost:5678");

// Lưu danh sách client (Frontend & ESP32)
const clients = new Set();

// Kết nối MySQL
let dbConnection;
async function connectDB() {
    if (!dbConnection) {
        dbConnection = await mysql.createConnection(dbConfig);
        console.log("Kết nối MySQL thành công!");
    }
    return dbConnection;
}

wss.on("connection", async (ws) => {
    console.log("Client mới đã kết nối.");
    clients.add(ws);
    ws.send(JSON.stringify({ status: "connected" }));

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            console.log("Nhận dữ liệu từ ESP32:", data);  // Log debug

            // Kiểm tra JSON hợp lệ
            if (!data || typeof data !== "object" || !Array.isArray(data.scales)) {
                console.log("Dữ liệu không hợp lệ:", data);
                ws.send(JSON.stringify({ status: "error", message: "Dữ liệu không hợp lệ" }));
                return;
            }

            const connection = await connectDB();
            if (!connection) {
                ws.send(JSON.stringify({ status: "error", message: "Không thể kết nối MySQL" }));
                return;
            }

            const updates = [];

            for (const item of data.scales) {
                if (!item.id || typeof item.quantity !== "number" || item.quantity < 0) {
                    console.log("Bỏ qua dữ liệu không hợp lệ:", item);
                    continue;
                }

                const ingredientId = item.id;
                const quantity = parseFloat(item.quantity);

                // Lấy min_threshold từ database
                const [rows] = await connection.execute(
                    "SELECT min_threshold FROM ingredients WHERE id = ?", [ingredientId]
                );

                if (rows.length === 0) {
                    console.log("Không tìm thấy nguyên liệu ID:", ingredientId);
                    continue;
                }

                const minThreshold = parseFloat(rows[0].min_threshold);
                const isSoldOut = quantity < minThreshold;

                // Cập nhật cơ sở dữ liệu ngay khi có dữ liệu
                await connection.execute("UPDATE ingredients SET quantity = ?, is_sold_out = ? WHERE id = ?", 
                    [quantity, isSoldOut, ingredientId]);

                // Thêm dữ liệu cập nhật
                updates.push({ id: ingredientId, quantity, isSoldOut });
            }

            // Nếu có cập nhật, gửi dữ liệu ngay lập tức đến tất cả client
            if (updates.length > 0) {
                const updateData = JSON.stringify({ status: "update", updates });
                console.log("Gửi dữ liệu cập nhật:", updateData);

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(updateData);
                    }
                });
            }
        } catch (err) {
            console.error("Lỗi xử lý JSON:", err);
            ws.send(JSON.stringify({ status: "error", message: "Lỗi xử lý JSON" }));
        }
    });

    ws.on("close", () => {
        console.log("Client đã mất kết nối.");
        clients.delete(ws);
    });

    ws.on("error", (err) => console.error("Lỗi WebSocket:", err));
});


// const WebSocket = require("ws");
// const mysql = require("mysql2/promise");

// // Cấu hình database
// const dbConfig = {
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "food",
// };

// // Tạo WebSocket Server
// const wss = new WebSocket.Server({ port: 5678 });
// console.log("WebSocket Server đang chạy trên ws://localhost:5678");

// // Lưu danh sách client (Frontend & ESP32)
// const clients = new Set();

// // Kết nối MySQL
// let dbConnection;
// async function connectDB() {
//     if (!dbConnection) {
//         dbConnection = await mysql.createConnection(dbConfig);
//         console.log("Kết nối MySQL thành công!");
//     }
//     return dbConnection;
// }

// wss.on("connection", async (ws) => {
//     console.log("Client mới đã kết nối.");
//     clients.add(ws);
//     ws.send(JSON.stringify({ status: "connected" }));

//     ws.on("message", async (message) => {
//         try {
//             const data = JSON.parse(message);
//             console.log("Nhận dữ liệu từ ESP32:", data);  // Log debug

//             // Kiểm tra JSON hợp lệ
//             if (!data || typeof data !== "object" || !Array.isArray(data.scales)) {
//                 console.log("Dữ liệu không hợp lệ:", data);
//                 ws.send(JSON.stringify({ status: "error", message: "Dữ liệu không hợp lệ" }));
//                 return;
//             }

//             const connection = await connectDB();
//             if (!connection) {
//                 ws.send(JSON.stringify({ status: "error", message: "Không thể kết nối MySQL" }));
//                 return;
//             }

//             const updatePromises = [];
//             const updates = [];

//             for (const item of data.scales) {
//                 if (!item.id || typeof item.quantity !== "number" || item.quantity < 0) {
//                     console.log("Bỏ qua dữ liệu không hợp lệ:", item);
//                     continue;
//                 }

//                 const ingredientId = item.id;
//                 const quantity = parseFloat(item.quantity);

//                 // Lấy min_threshold từ database
//                 const [rows] = await connection.execute(
//                     "SELECT min_threshold FROM ingredients WHERE id = ?", [ingredientId]
//                 );

//                 if (rows.length === 0) {
//                     console.log("Không tìm thấy nguyên liệu ID:", ingredientId);
//                     continue;
//                 }

//                 const minThreshold = parseFloat(rows[0].min_threshold);
//                 const isSoldOut = quantity < minThreshold;

//                 // Cập nhật cơ sở dữ liệu ngay khi có dữ liệu
//                 await connection.execute("UPDATE ingredients SET quantity = ? WHERE id = ?", [quantity, ingredientId]);

//                 // Thêm dữ liệu cập nhật
//                 updates.push({ id: ingredientId, quantity, isSoldOut });
//             }

//             // Nếu có cập nhật, gửi dữ liệu ngay lập tức đến tất cả client
//             if (updates.length > 0) {
//                 const updateData = JSON.stringify({ status: "update", updates });
//                 console.log("Gửi dữ liệu cập nhật:", updateData);

//                 clients.forEach(client => {
//                     if (client.readyState === WebSocket.OPEN) {
//                         client.send(updateData);
//                     }
//                 });
//             }
//         } catch (err) {
//             console.error("Lỗi xử lý JSON:", err);
//             ws.send(JSON.stringify({ status: "error", message: "Lỗi xử lý JSON" }));
//         }
//     });

//     ws.on("close", () => {
//         console.log("Client đã mất kết nối.");
//         clients.delete(ws);
//     });

//     ws.on("error", (err) => console.error("Lỗi WebSocket:", err));
// });
