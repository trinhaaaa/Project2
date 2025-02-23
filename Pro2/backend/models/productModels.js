const db = require("../db");

//  Lấy danh sách tất cả món ăn (chỉ lấy món chưa bị ẩn)
function getAllProducts() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM product WHERE deleted = 0"; 
    db.query(sql, (err, data) => {
      if (err) {
        console.error(" Lỗi khi lấy danh sách món ăn:", err);
        return reject(err);
      }
      resolve(data);
    });
  });
}

//  Lấy danh sách danh mục món ăn
function getAllMenuList() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM category";
    db.query(sql, (err, results) => {
      if (err) {
        console.error(" Lỗi khi lấy danh mục món ăn:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
}

//  Lấy danh sách món ăn bán chạy (chỉ hiển thị món chưa bị ẩn)
function getAllTopFoodList() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, SUM(od.quantity) AS total_quantity_sold
      FROM order_detail od
      JOIN product p ON od.product_id = p.product_id
      WHERE p.deleted = 0
      GROUP BY p.product_id
      ORDER BY total_quantity_sold DESC
      LIMIT 100
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error(" Lỗi khi lấy danh sách món bán chạy:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
}

//  Ẩn món ăn (cập nhật deleted = 1)
function removeFoodItemFromList(product_id) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE product SET deleted = 1 WHERE product_id = ?";
    db.query(sql, [product_id], (err, res) => {
      if (err) {
        console.error(` Lỗi khi ẩn món ${product_id}:`, err);
        return reject(err);
      }
      resolve(res.affectedRows > 0);
    });
  });
}

//  Hiển thị lại món ăn (cập nhật deleted = 0)
function restoreFoodItem(product_id) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE product SET deleted = 0 WHERE product_id = ?";
    db.query(sql, [product_id], (err, res) => {
      if (err) {
        console.error(` Lỗi khi khôi phục món ${product_id}:`, err);
        return reject(err);
      }
      resolve(res.affectedRows > 0);
    });
  });
}

//  Lấy danh sách món ăn bị ẩn (deleted = 1)
function getHiddenProducts() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM product WHERE deleted = 1";
    db.query(sql, (err, data) => {
      if (err) {
        console.error(" Lỗi khi lấy danh sách món bị ẩn:", err);
        return reject(err);
      }
      resolve(data);
    });
  });
}

module.exports = {
  getAllProducts,
  getAllMenuList,
  getAllTopFoodList,
  removeFoodItemFromList,
  restoreFoodItem,
  getHiddenProducts,
};
