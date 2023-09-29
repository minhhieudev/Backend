const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "training_point"; // Đảm bảo rằng modelName trùng với tên model của bạn
const TranningPointModel = db[modelName]; // Thay thế db[modelName] bằng biến dùng để truy cập model của bạn

// Route để lấy tất cả dữ liệu điểm rèn luyện
router.get(
  "/",
  $(async (req, res) => {
    try {
      const tranningPoints = await TranningPointModel.find();

      return res.json({ success: true, tranningPoints });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách điểm rèn luyện.",
      });
    }
  })
);

module.exports = router;
