const WebSocket = require('ws');
const mysql = require('mysql2');

const wss = new WebSocket.Server({ port: 8080 });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'food'
});

wss.on('connection', (ws) => {
    console.log('ESP32 connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { ingredient_id, quantity } = data;

        // Cập nhật trực tiếp bảng ingredients
        const updateQuery = "UPDATE ingredients SET quantity = ? WHERE id = ?";
        db.query(updateQuery, [quantity, ingredient_id], (err) => {
            if (err) throw err;
            console.log(`Updated ingredient ${ingredient_id}: ${quantity}kg`);

            // Gửi dữ liệu real-time đến frontend
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ ingredient_id, quantity }));
                }
            });
        });
    });

    ws.on('close', () => console.log('ESP32 disconnected'));
});

console.log("WebSocket server running on port 8080");
