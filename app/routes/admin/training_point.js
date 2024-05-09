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

router.post(
  "/updateIsShow",
  $(async (req, res) => {
    try {
      // Lấy bản ghi duy nhất của mô hình từ cơ sở dữ liệu
      const tranningPoint = await TranningPointModel.findOne();

      // Kiểm tra xem bản ghi có tồn tại không
      if (!tranningPoint) {
        return res.json({ success: false, error: "Không tìm thấy bản ghi." });
      }

      // Cập nhật trường isShow thành giá trị đối ngược
      tranningPoint.isShow = !tranningPoint.isShow;
      await tranningPoint.save(); // Lưu thay đổi

      return res.json({ success: true, message: "Cập nhật thành công." });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể cập nhật trường isShow.",
      });
    }
  })
);
module.exports = router;
