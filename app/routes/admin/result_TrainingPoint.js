const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "result_TrainingPoint";
const ResultTrainingPointModel = db[modelName];

// Route để lấy tất cả dữ liệu điểm rèn luyện
router.get(
  "/",
  $(async (req, res) => {
    try {
      const resultTrainingPoints = await ResultTrainingPointModel.find();
      return res.json({ success: true, resultTrainingPoints });
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
  
        if (data) {
          // TODO: Thêm các bước kiểm tra và xác thực dữ liệu đầu vào nếu cần
  
          const createdResultTrainingPointModel = await ResultTrainingPointModel.create(data);
  
          if (createdResultTrainingPointModel) {
            // Nếu tạo mới câu hỏi thành công, trả về thông tin câu hỏi vừa tạo
            return res.json({ success: true,
                resultTrainingPoint: createdResultTrainingPointModel,
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
