const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "detail_TrainingPoint";
const DetailTrainingPointModel = db[modelName];

// Route để lấy tất cả dữ liệu điểm rèn luyện
router.get(
  "/",
  $(async (req, res) => {
    try {
      const detailTrainingPoints = await DetailTrainingPointModel.find();
      return res.json({ success: true, detailTrainingPoints });
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
    "/",
    $(async (req, res) => {
      try {
        const data = req.body;
        console.log(data);
        if (data) {
          // TODO: Thêm các bước kiểm tra và xác thực dữ liệu đầu vào nếu cần
  
          const createdDetailTrainingPointModel = await DetailTrainingPointModel.create(data);
  
          if (createdDetailTrainingPointModel) {
            // Nếu tạo mới câu hỏi thành công, trả về thông tin câu hỏi vừa tạo
            return res.json({ success: true,
                detailTrainingPoint: createdDetailTrainingPointModel,
                message: "Lưu điêm thành công.", });
          } 
        } 
    } catch (error) {
            console.error("Error: ", error);
            return res.json({
              success: false,
              error: "Không thể lưu điểm rèn luyện mới.",
            });
          }
        })
      );
      

module.exports = router;
