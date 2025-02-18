const express = require("express");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const ingredientRoutes = require("./routes/ingredientRoutes.js");

app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", ingredientRoutes);

// Route kiểm tra server đang chạy
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Bắt đầu WebSocket
const startWebSocket = require("./websocket");
startWebSocket();

const PORT = 8801;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
