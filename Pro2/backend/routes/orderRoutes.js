const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/orderControllers");

router.post("/order", orderControllers.userOrder);
router.post("/myOrder", orderControllers.getOrderByUser);
router.get("/allOrder", orderControllers.getAllOrders);
router.post("/handleOrder", orderControllers.handleOrder);

module.exports = router;
const db = require("../db");
// Xử lý khi người dùng đặt hàng
exports.userOrder = (req, res) => {
    const { user_id, order_details } = req.body; // order_details là danh sách sản phẩm [{product_id, quantity}]

    // Thêm đơn hàng vào bảng customer_order
    const insertOrderQuery = "INSERT INTO customer_order (user_id, status, order_date) VALUES (?, 'pending', NOW())";
    db.query(insertOrderQuery, [user_id], (err, result) => {
        if (err) {
            console.error("Lỗi khi tạo đơn hàng:", err);
            return res.status(500).json({ success: false, message: "Lỗi khi tạo đơn hàng" });
        }

        const order_id = result.insertId; // Lấy ID của đơn hàng vừa tạo

        // Thêm từng món vào order_detail
        let orderQueries = order_details.map(item => {
            return new Promise((resolve, reject) => {
                const insertDetailQuery = "INSERT INTO order_detail (order_id, product_id, quantity) VALUES (?, ?, ?)";
                db.query(insertDetailQuery, [order_id, item.product_id, item.quantity], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });

        // Sau khi thêm xong order_detail, cập nhật nguyên liệu
        Promise.all(orderQueries)
            .then(() => {
                // Trừ nguyên liệu từ kho dựa trên bảng `recipe`
                let updateIngredientsQueries = order_details.map(item => {
                    return new Promise((resolve, reject) => {
                        const updateQuery = `
                            UPDATE ingredients i
                            JOIN recipe r ON i.id = r.ingredient_id
                            SET i.quantity = i.quantity - (? * r.quantity_required)
                            WHERE r.product_id = ?`;
                        
                        db.query(updateQuery, [item.quantity, item.product_id], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    });
                });

                return Promise.all(updateIngredientsQueries);
            })
            .then(() => {
                res.json({ success: true, message: "Đơn hàng đã được đặt và nguyên liệu đã được cập nhật" });
            })
            .catch(err => {
                console.error("Lỗi khi cập nhật nguyên liệu:", err);
                res.status(500).json({ success: false, message: "Lỗi khi cập nhật nguyên liệu" });
            });
    });
};