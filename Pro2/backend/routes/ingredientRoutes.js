const express = require("express");
const db = require("../db");  // Kết nối MySQL
const mysql = require("mysql2/promise"); // Import MySQL Promise
const router = express.Router();
const { updateDishAvailability } = require("../models/Ingredient"); // Hàm cập nhật trạng thái món ăn

// API lấy danh sách nguyên liệu
router.get("/ingredients", async (req, res) => {
    try {
        const [result] = await db.promise().query("SELECT * FROM ingredients");
        res.json(result);
    } catch (error) {
        console.error(" Lỗi lấy dữ liệu nguyên liệu:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

//  API tạo nguyên liệu mới
router.post("/ingredients", async (req, res) => {
    const { name, quantity, unit, min_threshold } = req.body;

    try {
        const [result] = await db.promise().query(
            "INSERT INTO ingredients (name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)",
            [name, quantity, unit, min_threshold]
        );

        //  Cập nhật trạng thái món ăn sau khi thêm nguyên liệu
        await updateDishAvailability();

        res.status(201).json({ id: result.insertId, name, quantity, unit, min_threshold });
    } catch (error) {
        console.error(" Lỗi thêm nguyên liệu:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

//  API kiểm tra trạng thái món ăn (Check Stock)
router.get("/check-stock/:id", async (req, res) => { 
    const productId = req.params.id;

    try {
        const [rows] = await db.promise().query(
            `SELECT r.product_id, i.id AS ingredient_id, i.name, i.quantity, i.min_threshold
             FROM recipe r
             JOIN ingredients i ON r.ingredient_id = i.id
             WHERE r.product_id = ?`, 
            [productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy món ăn hoặc không có nguyên liệu" });
        }

        const isSoldOut = rows.some(row => row.quantity < row.min_threshold);

        res.json({ isSoldOut, ingredients: rows });
    } catch (error) {
        console.error(" Lỗi API kiểm tra tồn kho:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

module.exports = router;
