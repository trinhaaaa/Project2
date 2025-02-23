const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers.js");

// Lấy danh sách món ăn (chỉ hiển thị món chưa bị ẩn)
router.get("/products", productControllers.getProductList);

// Lấy danh sách danh mục
router.get("/category", productControllers.getMenuList);

// Lấy danh sách món bán chạy (chỉ hiển thị món chưa bị ẩn)
router.get("/topProducts", productControllers.getTopProductList);

// Admin ẩn món ăn (cập nhật deleted = 1)
router.post("/removeItem", productControllers.removeFoodItem);

// Admin hiển thị lại món ăn (cập nhật deleted = 0)
router.post("/restoreItem", productControllers.restoreFoodItem);

// Tự động ẩn món ăn khi nguyên liệu không đủ
router.get("/check-and-hide-products", productControllers.checkAndHideProducts);

// Tự động hiển thị lại món ăn khi nhập nguyên liệu
router.get("/update-dish-availability", productControllers.updateDishAvailability);

router.get("/hiddenProducts", productControllers.getHiddenProducts);

module.exports = router;
