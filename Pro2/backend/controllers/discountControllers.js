const discountModel = require("../models/discountModel");

exports.autoDiscount = async (req, res) => {
    try {
        console.log("🔹 Bắt đầu kiểm tra nguyên liệu dư thừa...");

        const ingredient = await discountModel.getMostAbundantIngredient();
        if (!ingredient) {
            return res.status(400).json({ success: false, message: "Không có nguyên liệu nào dư thừa." });
        }

        const dish = await discountModel.getDishByIngredient(ingredient.id);
        if (!dish) {
            return res.status(400).json({ success: false, message: `Không tìm thấy món ăn cho ${ingredient.name}.` });
        }

        const hasDiscount = await discountModel.checkIfDiscountExists(dish.product_id);
        if (hasDiscount) {
            return res.status(400).json({ success: false, message: `Món ${dish.name} đã có giảm giá.` });
        }

        const newDiscountId = await discountModel.getMaxDiscountId();
        await discountModel.createDiscount(newDiscountId, ingredient.name, dish.product_id);
        await discountModel.linkDiscountToProduct(dish.product_id, newDiscountId);

        console.log(` Giảm giá 20% đã được áp dụng cho món ${dish.name}`);
        res.json({ success: true, message: ` Giảm giá 20% cho món ${dish.name} vì dư thừa ${ingredient.name}.` });

    } catch (error) {
        console.error(" Lỗi hệ thống:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi tạo giảm giá." });
    }
};
