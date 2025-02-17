const db = require('../db');

//  Tạo đơn hàng mới
function createUserOrder([
  fullname,
  phone,
  address,
  note,
  orderDate,
  amount,
  status,
  userId,
]) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO `customer_order`(`full_name`, `phone_number`, `address`, `note`, `order_date`,`amount`, `status`, `user_id`) VALUES (?,?,?,?,?,?,?,?)";
    db.query(
      sql,
      [fullname, phone, address, note, orderDate, amount, status, userId],
      (err, result) => {
        if (err) {
          console.error("SQL Error:", err);
          return reject(err);
        }
        resolve(result.insertId);
      }
    );
  });
}

//  Thêm chi tiết đơn hàng
function createOrderDetail(orderId, orderItems) {
  const promises = orderItems.map((item) => {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO `order_detail`(`order_id`, `product_id`,`product_name`,`price`, `quantity`) VALUES (?,?,?,?,?)";
      db.query(
        sql,
        [orderId, item.product_id, item.name, item.price, item.quantity],
        (err, result) => {
          if (err) {
            console.error("Fail to create order detail:", err);
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  });

  return Promise.all(promises);
}

//  Lấy danh sách đơn hàng của 1 người dùng
function selectOrderByUserId(user) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM `customer_order` WHERE `user_id`=? ORDER BY `order_date` DESC";
    db.query(sql, [user], (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

// Lấy chi tiết đơn hàng
function selectOrderDetail(orderId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM `order_detail` WHERE `order_id`=?";
    db.query(sql, [orderId], (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

// Lấy tất cả đơn hàng
function selectAllOrders() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM `customer_order` ORDER BY `order_date` DESC";
    db.query(sql, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

// Cập nhật trạng thái đơn hàng & trừ nguyên liệu
function changeOrderStatus(order_status, order_id) {
  return new Promise((resolve, reject) => {
    if (order_status === "confirmed" || order_status === "shipped") {
      //  Trừ nguyên liệu khi đơn hàng được xác nhận
      const updateIngredientsQuery = `
          UPDATE ingredients i
          JOIN recipe r ON i.id = r.ingredient_id
          JOIN order_detail od ON od.product_id = r.product_id
          SET i.quantity = i.quantity - (od.quantity * r.quantity_required)
          WHERE od.order_id = ?`;

      db.query(updateIngredientsQuery, [order_id], (err) => {
        if (err) return reject(err);
        console.log("Nguyên liệu đã cập nhật khi xác nhận đơn hàng.");

        // Cập nhật trạng thái đơn hàng
        const updateOrderQuery = "UPDATE customer_order SET status= ? WHERE order_id= ?";
        db.query(updateOrderQuery, [order_status, order_id], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });
    } else {
      // Nếu không phải trạng thái cần trừ nguyên liệu, chỉ cập nhật trạng thái đơn hàng
      const updateOrderQuery = "UPDATE customer_order SET status= ? WHERE order_id= ?";
      db.query(updateOrderQuery, [order_status, order_id], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    }
  });
}

//  Kiểm tra nếu nguyên liệu đủ để đặt hàng
function checkIngredientAvailability(orderItems) {
  return new Promise((resolve, reject) => {
    let insufficientIngredients = [];
    let queries = orderItems.map(item => {
      return new Promise((resolve, reject) => {
        const checkQuery = `
            SELECT i.name, i.quantity, r.quantity_required * ? AS needed
            FROM ingredients i
            JOIN recipe r ON i.id = r.ingredient_id
            WHERE r.product_id = ?`;

        db.query(checkQuery, [item.quantity, item.product_id], (err, rows) => {
          if (err) reject(err);
          rows.forEach(({ name, quantity, needed }) => {
            if (quantity < needed) {
              insufficientIngredients.push({ name, quantity, needed });
            }
          });
          resolve();
        });
      });
    });

    Promise.all(queries).then(() => {
      if (insufficientIngredients.length > 0) {
        reject({ message: "Nguyên liệu không đủ!", insufficientIngredients });
      } else {
        resolve();
      }
    }).catch(err => reject(err));
  });
}

// Trừ nguyên liệu ngay khi đặt hàng
function updateIngredientsAfterOrder(orderItems) {
  return new Promise((resolve, reject) => {
    let queries = orderItems.map(item => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
            UPDATE ingredients 
            JOIN recipe r ON ingredients.id = r.ingredient_id
            SET ingredients.quantity = ingredients.quantity - (? * r.quantity_required)
            WHERE r.product_id = ?`;

        db.query(updateQuery, [item.quantity, item.product_id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });

    Promise.all(queries)
      .then(() => resolve("Nguyên liệu đã trừ sau khi đặt hàng."))
      .catch(err => reject(err));
  });
}

module.exports = {
  createUserOrder,
  createOrderDetail,
  selectOrderDetail,
  selectOrderByUserId,
  selectAllOrders,
  changeOrderStatus,
  checkIngredientAvailability,  //  Kiểm tra nguyên liệu
  updateIngredientsAfterOrder  // Trừ nguyên liệu ngay sau khi đặt hàng
};
