const db = require("../db");

//  Lấy nguyên liệu dư thừa nhất
exports.getMostAbundantIngredient = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id, name FROM ingredients ORDER BY quantity DESC LIMIT 1 `,
            (err, result) => {
                if (err) {
                    console.error(" Lỗi lấy nguyên liệu dư thừa:", err);
                    reject(err);
                } else resolve(result.length > 0 ? result[0] : null);
            }
        );
    });
};

//  Lấy món ăn có sử dụng nguyên liệu nhiều nhất
exports.getDishByIngredient = (ingredientId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT p.product_id, p.name, SUM(r.quantity_required) AS total_usage
             FROM product p
             JOIN recipe r ON p.product_id = r.product_id
             WHERE r.ingredient_id = ?
             GROUP BY p.product_id, p.name
             ORDER BY total_usage DESC, p.price DESC
             LIMIT 1`,
            [ingredientId],
            (err, result) => {
                if (err) {
                    console.error(" Lỗi lấy món ăn từ nguyên liệu:", err);
                    reject(err);
                } else resolve(result.length > 0 ? result[0] : null);
            }
        );
    });
};

//  Kiểm tra xem sản phẩm đã có giảm giá chưa
exports.checkIfDiscountExists = (productId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT d.id FROM discount d 
             JOIN promote p ON d.id = p.id_discount
             WHERE p.id_product = ? 
             LIMIT 1`,
            [productId],
            (err, result) => {
                if (err) {
                    console.error(" Lỗi kiểm tra giảm giá:", err);
                    reject(err);
                } else resolve(result.length > 0);
            }
        );
    });
};

//  Lấy ID giảm giá mới
exports.getMaxDiscountId = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM discount`, (err, result) => {
            if (err) {
                console.error(" Lỗi lấy ID giảm giá mới:", err);
                reject(err);
            } else resolve(result[0].new_id);
        });
    });
};

//  Tạo giảm giá mới
exports.createDiscount = (discountId, ingredientName, productId) => {
    return new Promise((resolve, reject) => {
        const discountName = `Giảm giá do dư thừa ${ingredientName}`;
        const discountCode = `AUTO20-${productId}`;

        db.query(
            `INSERT INTO discount (id, name, code, value, date_exp, count)
             VALUES (?, ?, ?, 20, NOW() + INTERVAL 1 DAY, 100)`,
            [discountId, discountName, discountCode],
            (err) => {
                if (err) {
                    console.error(" Lỗi tạo giảm giá:", err);
                    reject(err);
                } else resolve();
            }
        );
    });
};

//  Liên kết giảm giá với món ăn
exports.linkDiscountToProduct = (productId, discountId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO promote (id_product, id_discount) 
             SELECT ?, ? 
             WHERE NOT EXISTS (
                 SELECT 1 FROM promote WHERE id_product = ? AND id_discount = ?
             )`,
            [productId, discountId, productId, discountId],
            (err) => {
                if (err) {
                    console.error(" Lỗi liên kết giảm giá:", err);
                    reject(err);
                } else resolve();
            }
        );
    });
};
