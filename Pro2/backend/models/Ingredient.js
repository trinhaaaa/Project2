// const db = require('../db');

// const Ingredient = {
//   // Lấy danh sách nguyên liệu
//   getAll: (callback) => {
//     db.query("SELECT * FROM ingredients", (err, results) => {
//       if (err) {
//         console.error("Lỗi truy vấn cơ sở dữ liệu:", err);
//         callback(err, null);
//         return;
//       }
//       callback(null, results);
//     });
//   },

//   // Thêm nguyên liệu mới
//   add: (name, quantity, unit, min_threshold, callback) => {
//     db.query(
//       "INSERT INTO ingredients (name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)",
//       [name, quantity, unit, min_threshold],
//       (err, result) => {
//         if (err) {
//           console.error("Lỗi khi thêm nguyên liệu:", err);
//           callback(err, null);
//           return;
//         }
//         callback(null, result);
//       }
//     );
//   },

//   // Xóa nguyên liệu theo ID
//   delete: (id, callback) => {
//     db.query("DELETE FROM ingredients WHERE id = ?", [id], (err, result) => {
//       if (err) {
//         console.error("Lỗi khi xóa nguyên liệu:", err);
//         callback(err, null);
//         return;
//       }
//       callback(null, result);
//     });
//   },
// };

// module.exports = Ingredient;

const db = require('../db');

const Ingredient = {
  // Lấy danh sách nguyên liệu
  getAll: (callback) => {
    db.query("SELECT * FROM ingredients", (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn cơ sở dữ liệu:", err);
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  },

  // Thêm nguyên liệu mới
  add: (name, quantity, unit, min_threshold, callback) => {
    db.query(
      "INSERT INTO ingredients (name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)",
      [name, quantity, unit, min_threshold],
      async (err, result) => {
        if (err) {
          console.error("Lỗi khi thêm nguyên liệu:", err);
          callback(err, null);
          return;
        }
        // Cập nhật trạng thái món ăn sau khi thêm nguyên liệu
        await Ingredient.updateDishAvailability();
        callback(null, result);
      }
    );
  },

  // Xóa nguyên liệu theo ID
  delete: (id, callback) => {
    db.query("DELETE FROM ingredients WHERE id = ?", [id], async (err, result) => {
      if (err) {
        console.error("Lỗi khi xóa nguyên liệu:", err);
        callback(err, null);
        return;
      }
      // Cập nhật trạng thái món ăn sau khi xóa nguyên liệu
      await Ingredient.updateDishAvailability();
      callback(null, result);
    });
  },

  // Cập nhật trạng thái món ăn dựa vào nguyên liệu có đủ hay không
  updateDishAvailability: async () => {
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
};

module.exports = Ingredient;
