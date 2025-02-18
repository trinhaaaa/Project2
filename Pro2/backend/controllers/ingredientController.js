const Ingredient = require('../models/Ingredient');

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

  Ingredient.add(name, quantity, unit, min_threshold, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi thêm nguyên liệu" });
    }
    res.json({ message: "Nguyên liệu đã được thêm!", id: result.insertId });
  });
};

// Xóa nguyên liệu theo ID
exports.deleteIngredient = (req, res) => {
  const { id } = req.params;
  Ingredient.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi xóa nguyên liệu" });
    }
    res.json({ message: "Nguyên liệu đã được xóa!" });
  });
};
