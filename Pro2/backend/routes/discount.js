const express = require("express");
const router = express.Router();
const db = require("../db"); // Kết nối MySQL

//  Lấy danh sách discount
router.get("/", async (req, res) => {
    try {
        const [discounts] = await db.query("SELECT * FROM discount");
        res.json(discounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách giảm giá" });
    }
});

// Tạo discount mới
router.post("/create", async (req, res) => {
    const { name, code, value, date_exp, count } = req.body;
    try {
        await db.query(
            "INSERT INTO discount (name, code, value, date_exp, count) VALUES (?, ?, ?, ?, ?)",
            [name, code, value, date_exp, count]
        );
        res.json({ message: "Thêm discount thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi thêm discount" });
    }
});

//  Áp dụng discount cho món ăn
router.post("/apply", async (req, res) => {
    const { product_id, discount_id } = req.body;
    try {
        await db.query("INSERT INTO promote (id_product, id_discount) VALUES (?, ?)", [product_id, discount_id]);
        res.json({ message: "Áp dụng giảm giá thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi áp dụng giảm giá" });
    }
});

//  Tạo giảm giá tự động dựa vào nguyên liệu dư thừa
router.post("/auto-discount", async (req, res) => {
    try {
        const [mostIngredient] = await db.query(`
            SELECT id FROM ingredients ORDER BY quantity DESC LIMIT 1;
        `);

        if (!mostIngredient.length) return res.status(400).json({ message: "Không có nguyên liệu nào." });

        const ingredientId = mostIngredient[0].id;

        const [dish] = await db.query(`
            SELECT p.product_id FROM product p
            JOIN recipe r ON p.product_id = r.product_id
            WHERE r.ingredient_id = ?
            ORDER BY p.price DESC LIMIT 1;
        `, [ingredientId]);

        if (!dish.length) return res.status(400).json({ message: "Không tìm thấy món ăn phù hợp." });

        const productId = dish[0].product_id;

        await db.query(`
            INSERT INTO discount (name, code, value, date_exp, count)
            VALUES ('Giảm giá tồn kho', 'AUTO20', 20, NOW() + INTERVAL 1 DAY, 100);
        `);

        const [lastDiscount] = await db.query(`SELECT id FROM discount ORDER BY id DESC LIMIT 1;`);

        await db.query(`INSERT INTO promote (id_product, id_discount) VALUES (?, ?);`, [productId, lastDiscount[0].id]);

        res.json({ message: `Giảm giá 20% cho món ${productId}` });

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

//  Xóa discount
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM discount WHERE id = ?", [id]);
        res.json({ message: "Xóa discount thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi xóa discount" });
    }
});

module.exports = router;
