const express = require("express");
const router = express.Router();
const discountControllers = require("../controllers/discountControllers"); // ❌ Lỗi vì file không được export đúng

router.get("/", discountControllers.getDiscounts);
router.post("/auto-discount", discountControllers.autoDiscount);
router.delete("/delete-all", discountControllers.deleteAllDiscounts);

module.exports = router;
