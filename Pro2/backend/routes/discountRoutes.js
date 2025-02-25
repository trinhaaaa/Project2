const express = require("express");
const router = express.Router();
const discountControllers = require("../controllers/discountControllers");

//  Kiểm tra API giảm giá có hoạt động không
router.get("/", (req, res) => {
    res.json({ success: true, message: "API giảm giá đang hoạt động!" });
});

//  Tạo giảm giá tự động
router.post("/auto-discount", discountControllers.autoDiscount);

module.exports = router;
