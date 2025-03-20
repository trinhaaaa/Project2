const db = require("../db"); // Import database connection
const productModel = require("../models/productModels.js");

//  Lấy danh sách tất cả món ăn (chỉ lấy món còn bán)
const getProductList = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách món ăn:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách món ăn!" });
  }
};

//  Lấy danh sách danh mục món ăn
const getMenuList = async (req, res) => {
  try {
    const menuList = await productModel.getAllMenuList();
    res.status(200).json(menuList);
  } catch (err) {
    console.error(" Lỗi khi lấy danh mục món ăn:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh mục món ăn!" });
  }
};

//  Lấy danh sách món ăn bán chạy (chỉ lấy món còn bán)
const getTopProductList = async (req, res) => {
  try {
    const topList = await productModel.getAllTopFoodList();
    res.status(200).json(topList);
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách món bán chạy:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách món bán chạy!" });
  }
};

//  Admin ẩn món ăn (cập nhật `deleted = 1`)
const removeFoodItem = async (req, res) => {
  try {
    const { product_id } = req.body;
    const sql = "UPDATE product SET deleted = 1 WHERE product_id = ?";
    db.query(sql, [product_id], (err, result) => {
      if (err) {
        console.error(" Lỗi MySQL khi ẩn món ăn:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi ẩn món ăn!" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json({
          success: true,
          message: ` Món ăn ${product_id} đã được ẩn!`,
        });
      } else {
        res.status(400).json({ success: false, message: " Không tìm thấy món ăn để ẩn!" });
      }
    });
  } catch (err) {
    console.error(" Lỗi server khi ẩn món ăn:", err);
    res.status(500).json({ success: false, message: `Lỗi server khi ẩn món ăn: ${product_id}` });
  }
};

//  Admin hiển thị lại món ăn (cập nhật `deleted = 0`)
const restoreFoodItem = async (req, res) => {
  try {
    const { product_id } = req.body;
    const sql = "UPDATE product SET deleted = 0 WHERE product_id = ?";
    db.query(sql, [product_id], (err, result) => {
      if (err) {
        console.error(" Lỗi MySQL khi khôi phục món ăn:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi khôi phục món ăn!" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json({
          success: true,
          message: ` Món ăn ${product_id} đã được hiển thị lại!`,
        });
      } else {
        res.status(400).json({ success: false, message: " Không tìm thấy món ăn để khôi phục!" });
      }
    });
  } catch (err) {
    console.error(" Lỗi server khi khôi phục món ăn:", err);
    res.status(500).json({ success: false, message: `Lỗi server khi khôi phục món ăn: ${product_id}` });
  }
};

// Lấy danh sách món ăn bị ẩn (deleted = 1)
const getHiddenProducts = async (req, res) => {
  try {
    const sql = "SELECT * FROM product WHERE deleted = 1";
    db.query(sql, (err, results) => {
      if (err) {
        console.error(" Lỗi truy vấn MySQL:", err);
        return res.status(500).json({ success: false, message: " Lỗi truy vấn MySQL!" });
      }
      console.log(" Danh sách món bị ẩn:", results);
      res.status(200).json(results);
    });
  } catch (error) {
    console.error(" Lỗi server:", error);
    res.status(500).json({ success: false, message: " Lỗi server!" });
  }
};

//  Ẩn món ăn tự động khi nguyên liệu hết
const checkAndHideProducts = async (req, res) => {
  try {
    await productModel.updateProductStatus();
    res.json({ message: " Đã ẩn món ăn không đủ nguyên liệu!" });
  } catch (error) {
    console.error(" Lỗi khi ẩn món ăn:", error);
    res.status(500).json({ message: " Lỗi server khi ẩn món ăn" });
  }
};

//  Hiển thị lại món ăn tự động khi nhập nguyên liệu
const updateDishAvailability = async (req, res) => {
  try {
    await productModel.restoreProductStatus();
    res.json({ message: " Món ăn đã được hiển thị lại!" });
  } catch (error) {
    console.error(" Lỗi khi cập nhật món ăn:", error);
    res.status(500).json({ message: " Lỗi server khi cập nhật món ăn" });
  }
};

module.exports = {
  getProductList,
  getMenuList,
  getTopProductList,
  removeFoodItem,
  restoreFoodItem,
  getHiddenProducts,
  checkAndHideProducts,
  updateDishAvailability,
};
