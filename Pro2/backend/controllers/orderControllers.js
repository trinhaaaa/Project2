const orderModel = require("../models/orderModels");

async function userOrder(req, res) {
    try {
        const { userId, amount, orderInfo, orderItems } = req.body;
        const status = "In processing";
        const now = new Date();
        const orderDate = now.toISOString().slice(0, 19).replace("T", " ");

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Tạo đơn hàng mới
        const orderId = await orderModel.createUserOrder([
            orderInfo.fullname,
            orderInfo.phone,
            orderInfo.address,
            orderInfo.note,
            orderDate,
            amount,
            status,
            userId,
        ]);

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Failed to create order" });
        }

        console.log(`Đã tạo đơn hàng mới: ${orderId}`);

        // Thêm chi tiết đơn hàng
        await orderModel.createOrderDetail(orderId, orderItems);
        console.log(`Đã thêm chi tiết đơn hàng cho order_id: ${orderId}`);

        // Kiểm tra nếu nguyên liệu đủ mới trừ
        try {
            await orderModel.checkIngredientAvailability(orderItems);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message, insufficientIngredients: err.insufficientIngredients });
        }

        // Trừ nguyên liệu từ kho
        await orderModel.updateIngredientsAfterOrder(orderItems);
        console.log("Nguyên liệu đã được cập nhật.");

        return res.status(200).json({ success: true, message: "Đơn hàng đã được đặt, nguyên liệu đã cập nhật" });

    } catch (err) {
        console.error("Lỗi khi tạo đơn hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống", error: err });
    }
}

async function getOrderByUser(req, res) {
    try {
        const { user } = req.body;
        const getOrder = await orderModel.selectOrderByUserId(user);

        if (getOrder.length === 0) {
            return res.json({ success: false, message: "Bạn chưa đặt đơn hàng nào." });
        }

        const listOrderPromises = getOrder.map(async (order) => {
            let eachOrder = order;
            const orderDetail = await orderModel.selectOrderDetail(order.order_id);
            eachOrder["items"] = orderDetail;
            return eachOrder;
        });

        const listOrder = await Promise.all(listOrderPromises);
        return res.status(200).json(listOrder);

    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi lấy đơn hàng.", error: err });
    }
}

async function getAllOrders(req, res) {
    try {
        const getAllOrder = await orderModel.selectAllOrders();

        if (getAllOrder.length === 0) {
            return res.json({ success: false, message: "Không có đơn hàng nào." });
        }

        const listOrderPromises = getAllOrder.map(async (order) => {
            let eachOrder = order;
            const orderDetail = await orderModel.selectOrderDetail(order.order_id);
            eachOrder["items"] = orderDetail;
            return eachOrder;
        });

        const listOrder = await Promise.all(listOrderPromises);
        return res.status(200).json(listOrder);

    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi lấy tất cả đơn hàng.", error: err });
    }
}

async function handleOrder(req, res) {
    const { order_status, order_id } = req.body;
    try {
        const result = await orderModel.changeOrderStatus(order_status, order_id);
        if (result) {
            return res.status(200).json({ success: true, message: "Đơn hàng đã được xử lý thành công." });
        } else {
            return res.json({ success: false, message: "Không thể xử lý đơn hàng." });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi xử lý đơn hàng.", error: err });
    }
}

module.exports = { userOrder, getOrderByUser, getAllOrders, handleOrder };
