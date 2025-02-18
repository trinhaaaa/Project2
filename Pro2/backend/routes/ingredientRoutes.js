const express = require("express");
const db = require("../db");  // Kết nối MySQL
const router = express.Router();

// lấy danh sách nguyên liệu
router.get("/ingredients", (req, res) => {
    db.query("SELECT * FROM ingredients", (err, result) => {
        if (err) {
            console.error("Lỗi lấy dữ liệu nguyên liệu:", err);
            return res.status(500).json({ error: "Lỗi server" });
        }
        res.json(result);
    });
});

// tạo nguyên liệu mới
router.post("/ingredients", (req, res) => {
    const { name, quantity, unit, min_threshold } = req.body;
    const insertQuery = "INSERT INTO ingredients (name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)";

    db.query(insertQuery, [name, quantity, unit, min_threshold], (err, result) => {
        if (err) {
            console.error("Lỗi thêm nguyên liệu:", err);
            return res.status(500).json({ error: "Lỗi server" });
        }

        const newIngredient = { id: result.insertId, name, quantity, unit, min_threshold };
        res.status(201).json(newIngredient);
    });
});

module.exports = router;
