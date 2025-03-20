// const Ingredient = require('../models/Ingredient');

// // Lấy danh sách nguyên liệu
// exports.getAllIngredients = (req, res) => {
//   Ingredient.getAll((err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
//     }
//     res.json(results);
//   });
// };

// // Thêm nguyên liệu mới
// exports.addIngredient = (req, res) => {
//   const { name, quantity, unit, min_threshold } = req.body;
//   if (!name || !quantity || !unit || !min_threshold) {
//     return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
//   }

//   Ingredient.add(name, quantity, unit, min_threshold, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: "Lỗi khi thêm nguyên liệu" });
//     }
//     res.json({ message: "Nguyên liệu đã được thêm!", id: result.insertId });
//   });
// };

// // Xóa nguyên liệu theo ID
// exports.deleteIngredient = (req, res) => {
//   const { id } = req.params;
//   Ingredient.delete(id, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: "Lỗi khi xóa nguyên liệu" });
//     }
//     res.json({ message: "Nguyên liệu đã được xóa!" });
//   });
// };
const Ingredient = require('../models/Ingredient');
const db = require('../config/db'); // Kết nối database

// Lấy danh sách nguyên liệu
exports.getAllIngredients = (req, res) => {
  Ingredient.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
    }
    res.json(results);
  });
};

// Thêm nguyên liệu mới
exports.addIngredient = (req, res) => {
  const { name, quantity, unit, min_threshold } = req.body;
  if (!name || !quantity || !unit || !min_threshold) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
  }

  Ingredient.add(name, quantity, unit, min_threshold, async (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi thêm nguyên liệu" });
    }

    // Kiểm tra trạng thái món ăn
    await updateDishAvailability();

    res.json({ message: "Nguyên liệu đã được thêm!", id: result.insertId });
  });
};

// Xóa nguyên liệu theo ID
exports.deleteIngredient = async (req, res) => {
  const { id } = req.params;
  Ingredient.delete(id, async (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi xóa nguyên liệu" });
    }

    // Kiểm tra trạng thái món ăn
    await updateDishAvailability();

    res.json({ message: "Nguyên liệu đã được xóa!" });
  });
};

// Cập nhật trạng thái món ăn dựa vào nguyên liệu nhưng không thay đổi delete
async function updateDishAvailability() {
  try {
    const [dishes] = await db.query(`
      SELECT p.product_id, p.name AS dish_name, 
             MIN(i.quantity / r.quantity_required) AS availability_ratio
      FROM product p
      JOIN recipe r ON p.product_id = r.product_id
      JOIN ingredients i ON r.ingredient_id = i.id
      GROUP BY p.product_id
    `);

    for (let dish of dishes) {
      const newStatus = dish.availability_ratio > 1 ? 'available' : 'sold_out';
      await db.query(`UPDATE product SET description = ? WHERE product_id = ?`, 
        [newStatus === 'sold_out' ? 'SOLD_OUT' : 'Món ngon!', dish.product_id]);
    }

    console.log("Cập nhật trạng thái món ăn hoàn tất.");
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái món ăn:", err);
  }
}
