const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "detailTrainingPoint";
const DetailTrainingPointModel = db[modelName];

router.get(
  "/",
  $(async (req, res) => {
    try {
      const detailTrainingPoints = await DetailTrainingPointModel.aggregate([
        {
          $lookup: {
            from: "users", // Tên của collection trong MongoDB (users hoặc tên tương ứng)
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $lookup: {
            from: "students", // Tên của collection trong MongoDB (students hoặc tên tương ứng)
            localField: "userDetails.email",
            foreignField: "email",
            as: "studentDetails",
          },
        },
        {
          $unwind: "$studentDetails",
        },
        {
          $project: {
            _id: 1,
            criteriaList: 1,
            semester: 1,
            schoolYear: 1,
            Total_selfAssessment: 1,
            Total_groupAssessment: 1,
            Total_consultantAssessment: 1,
            studentDetails: 1, // Thêm thông tin của student vào kết quả
          },
        },
      ]);

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
