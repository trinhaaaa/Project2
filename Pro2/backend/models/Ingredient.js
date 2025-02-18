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
      (err, result) => {
        if (err) {
          console.error("Lỗi khi thêm nguyên liệu:", err);
          callback(err, null);
          return;
        }
        callback(null, result);
      }
    );
  },

  // Xóa nguyên liệu theo ID
  delete: (id, callback) => {
    db.query("DELETE FROM ingredients WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Lỗi khi xóa nguyên liệu:", err);
        callback(err, null);
        return;
      }
      callback(null, result);
    });
  },
};

module.exports = Ingredient;
