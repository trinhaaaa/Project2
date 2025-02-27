const discountModel = require("../models/discountModel");

exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await discountModel.getDiscounts();
        res.json({ success: true, discounts });
    } catch (error) {
        console.error("Lỗi lấy danh sách giảm giá:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách giảm giá." });
    }
};

exports.autoDiscount = async (req, res) => {
    try {
        console.log("Bắt đầu kiểm tra nguyên liệu dư thừa...");

        const ingredient = await discountModel.getMostAbundantIngredient();
        console.log("Nguyên liệu dư thừa:", ingredient);

        if (!ingredient) {
            return res.status(400).json({ success: false, message: "Không có nguyên liệu nào dư thừa." });
        }

        const dish = await discountModel.getDishByIngredient(ingredient.id);
        console.log("Món ăn sử dụng nguyên liệu:", dish);

        if (!dish) {
            return res.status(400).json({ success: false, message: `Không tìm thấy món ăn cho ${ingredient.name}.` });
        }

        const hasDiscount = await discountModel.checkIfDiscountExists(dish.product_id);
        console.log("Kiểm tra món đã có giảm giá:", hasDiscount);

        if (hasDiscount) {
            return res.status(400).json({ success: false, message: `Món ${dish.name} đã có giảm giá.` });
        }

        const newDiscountId = await discountModel.getMaxDiscountId();
        console.log("ID giảm giá mới:", newDiscountId);

        await discountModel.createDiscount(newDiscountId, ingredient.name, dish.product_id);
        console.log("Đã tạo giảm giá mới");

        await discountModel.linkDiscountToProduct(dish.product_id, newDiscountId);
        console.log("Đã liên kết giảm giá với sản phẩm");

        res.json({ 
            success: true, 
            message: `Giảm giá 20% cho món ${dish.name} vì dư thừa ${ingredient.name}.`,
            discount: { 
                id: newDiscountId, 
                dish_name: dish.name, 
                value: 20 
            }
        });

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi tạo giảm giá." });
    }
};

exports.deleteAllDiscounts = async (req, res) => {
    try {
        await discountModel.deleteAllDiscounts();
        res.json({ success: true, message: "Đã xoá toàn bộ giảm giá." });
    } catch (error) {
        console.error("Lỗi khi xoá giảm giá:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xoá giảm giá." });
    }
};
