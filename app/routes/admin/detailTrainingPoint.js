const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "detailTrainingPoint";
const DetailTrainingPointModel = db[modelName];

// Lấy danh sách điểm rèn luyện
router.get(
  "/",
  $(async (req, res) => {
    try {
      const detailTrainingPoints = await DetailTrainingPointModel.aggregate([
        {
          $lookup: {
            from: "users",
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
            from: "students",
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
            studentDetails: 1,
          },
        },
      ]);

      return res.json({ success: true, detailTrainingPoints });
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  })
);

// Lấy chi tiết điểm rèn luyện theo ID
router.get("/:id", $(async (req, res) => {
  const id = req.params.id;
  if (id) {
    const doc = await DetailTrainingPointModel.findOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null;
    });

    if (doc) {
      return res.json({ success: true, detailTrainingPoint: doc });
    }
  }

  return res.status(404).json({ success: false, error: "Not Found" });
}));

// Lưu điểm rèn luyện mới
router.post(
  "/",
  $(async (req, res) => {
    try {
      const data = req.body;
      if (data) {
        // TODO: Thêm các bước kiểm tra và xác thực dữ liệu đầu vào nếu cần

        const createdDetailTrainingPointModel = await DetailTrainingPointModel.create(data);

        if (createdDetailTrainingPointModel) {
          return res.status(201).json({
            success: true,
            detailTrainingPoint: createdDetailTrainingPointModel,
            message: "Lưu điểm thành công.",
          });
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  })
);

module.exports = router;
