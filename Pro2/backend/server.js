const express = require("express");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const ingredientRoutes = require("./routes/ingredientRoutes.js");
const discountRoutes = require("./routes/discountRoutes.js");
app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", ingredientRoutes);
app.use("/api/discount", discountRoutes);
// Kiểm tra server
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Bắt đầu WebSocket
 require("./websocket");


const PORT = 8801;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});