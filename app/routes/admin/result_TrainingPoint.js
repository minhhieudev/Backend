const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "result_TrainingPoint";
const ResultTrainingPointModel = db[modelName];

// Route để lấy tất cả dữ liệu điểm rèn luyện
// router.get(
//   "/",
//   $(async (req, res) => {
//     try {
//       const resultTrainingPoints = await ResultTrainingPointModel.find();
//       return res.json({ success: true, resultTrainingPoints });
//     } catch (error) {
//       console.error("Error: ", error);
//       return res.json({
//         success: false,
//         error: "Không thể lấy danh sách điểm rèn luyện.",
//       });
//     }
//   })
// );


router.get(
  "/",
  $(async (req, res) => {
    try {
      const resultTrainingPoints = await ResultTrainingPointModel.aggregate([
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
            semester1: 1,
            semester2: 1,
            schoolYear: 1,
            wholeYear: 1,
            studentDetails: 1, // Thêm thông tin của student vào kết quả
          },
        },
      ]);

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
  "/update/:userId/:schoolYear",
  $(async (req, res) => {
    try {

      const { semester2Data, wholeYear } = req.body;

      // Thực hiện truy vấn findOne để lấy điểm kỳ 1 tương ứng với userId và schoolYear
      const semester1Data = await ResultTrainingPointModel.findOne({ user: req.params.userId, schoolYear: req.params.schoolYear });

      // Kiểm tra nếu không có dữ liệu
      if (!semester1Data) {
        return res.json({
          success: false,
          error: "Không tìm thấy điểm kỳ 1 cho người dùng và năm học đã cho.",
        });
      }

      // Kiểm tra dữ liệu semester2Data để đảm bảo nó không rỗng và có định dạng đúng
      if (!semester2Data || typeof semester2Data !== "object") {
        return res.json({
          success: false,
          error: "Dữ liệu kỳ 2 không hợp lệ.",
        });
      }

      // Cập nhật điểm kỳ 2
      semester1Data.semester2 = semester2Data;

      // Kiểm tra nếu wholeYear không được khởi tạo, hãy khởi tạo nó
      if (!semester1Data.wholeYear) {
        semester1Data.wholeYear = {};
      }

      // Cập nhật điểm cả năm
      semester1Data.wholeYear = wholeYear;

      await semester1Data.save();

      return res.json({ success: true, message: "Cập nhật điểm kỳ 2 và cả năm thành công." });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể cập nhật điểm kỳ 2 và cả năm.",
      });
    }
  })
);

router.get(
  "/:userId/:schoolYear",
  async (req, res) => {
    try {
      const { userId, schoolYear } = req.params;

      // Thực hiện truy vấn findOne để lấy điểm kỳ 1 tương ứng với userId và schoolYear
      const semester1Data = await ResultTrainingPointModel.findOne({ user: userId, schoolYear });

      // Kiểm tra nếu không có dữ liệu
      if (!semester1Data) {
        return res.json({
          success: false,
          error: "Không tìm thấy điểm kỳ 1 cho người dùng và năm học đã cho.",
        });
      }

      // Trả về dữ liệu kỳ 1 nếu tìm thấy
      return res.json({ success: true, semester1Data });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy điểm kỳ 1.",
      });
    }
  }
);

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Thực hiện truy vấn findOne để lấy điểm kỳ 1 tương ứng với userId và schoolYear
    const trainingPointStudent = await ResultTrainingPointModel.find(
      { user: userId },
      // Projection: chỉ lấy các trường mong muốn, 0 là để loại bỏ
      { _id: 0,user:0,createdAt: 0,updatedAt:0}
    );

    // Kiểm tra nếu không có dữ liệu
    if (!trainingPointStudent) {
      return res.json({
        success: false,
        error: "Không tìm thấy điểm rèn luyện cho sinh viên.",
      });
    }

    // Trả về dữ liệu kỳ 1 nếu tìm thấy
    return res.json({ success: true, trainingPointStudent });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy điểm rèn luyện.",
    });
  }
});


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
          return res.json({
            success: true,
            resultTrainingPoint: createdResultTrainingPointModel,
            message: "Lưu điểm thành công.",
          });
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
