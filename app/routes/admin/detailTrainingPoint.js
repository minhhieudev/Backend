const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "detailTrainingPoint";
const DetailTrainingPointModel = db[modelName];


router.get(
  "/search",
  $(async (req, res) => {
    try {
      const { semester, schoolYear } = req.query;

      // Kiểm tra nếu không có giá trị semester hoặc schoolYear được cung cấp
      if (!semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          error: "Missing required query parameters: semester and schoolYear",
        });
      }

      // Truy vấn cơ sở dữ liệu DetailTrainingPointModel với điều kiện semester và schoolYear
      const result = await DetailTrainingPointModel.aggregate([
        {
          $match: {
            semester: semester,
            schoolYear: schoolYear,
          },
        },
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
            status: 1,
            Total_selfAssessment: 1,
            Total_groupAssessment: 1,
            Total_consultantAssessment: 1,
            studentDetails: 1,
            createdAt: 1,
          },
        },
      ]);

      // Trả về kết quả dưới dạng JSON
      return res.json({ success: true, result });
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  })
);

// Lấy danh sách điểm rèn luyện
router.post(
  "/getCondition",
  $(async (req, res) => {
    try {

      const { schoolYear, semester, department, className } = req.body;

      const matchConditions = {};

      if (schoolYear) {
        matchConditions["schoolYear"] = schoolYear;
      }
      if (semester) {
        matchConditions["semester"] = String(semester);
      }
      if (department) {
        matchConditions["department"] = department;
      }
      if (className) {
        matchConditions["className"] = className;
      }
      console.log(matchConditions)
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
          $match: matchConditions // Sử dụng các điều kiện chỉ khi chúng có giá trị
        },
        {
          $project: {
            _id: 1,
            criteriaList: 1,
            semester: 1,
            schoolYear: 1,
            status: 1,
            Total_selfAssessment: 1,
            Total_groupAssessment: 1,
            Total_consultantAssessment: 1,
            studentDetails: 1,
            createdAt: 1
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


router.post(
  "/status/:id",
  $(async (req, res) => {
    try {
      const postId = req.params.id;
      const result = req.body.result; // Lấy giá trị result từ request body

      // Cập nhật trạng thái và Total_consultantAssessment của câu hỏi có ID tương ứng
      await DetailTrainingPointModel.updateOne(
        { _id: postId },
        { $set: { status: true, Total_consultantAssessment: result } }
      );

      res.json({ success: true, status: 'success', message: 'Duyệt thành công.' });
    } catch (error) {
      console.error("Error updating status: ", error);
      res.json({ success: false, error: "Error updating status." });
    }
  })
);


router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, error: "Missing ID parameter" });
    }

    const doc = await DetailTrainingPointModel.findOne({ _id: id }).exec();

    if (doc) {
      const detailTrainingPoint = await DetailTrainingPointModel.aggregate([
        {
          $match: { _id: doc._id },
        },
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
            status: 1,
            Total_selfAssessment: 1,
            Total_groupAssessment: 1,
            Total_consultantAssessment: 1,
            studentDetails: 1,
            createdAt: 1,
            // Bao gồm thêm userDetails._id
            "userDetails._id": 1, // Trả về _id của user
          },
        },
      ]);

      return res.json({ success: true, detailTrainingPoint: detailTrainingPoint[0] });
    } else {
      return res.status(404).json({ success: false, error: "Not Found" });
    }
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// Lấy chi tiết điểm rèn luyện theo ID
// router.get("/:id", $(async (req, res) => {
//   const id = req.params.id;
//   if (id) {
//     const doc = await DetailTrainingPointModel.findOne({ _id: id }).catch(error => {
//       console.error('Error: ', error);
//       return null;
//     });

//     if (doc) {
//       return res.json({ success: true, detailTrainingPoint: doc });
//     }
//   }

//   return res.status(404).json({ success: false, error: "Not Found" });
// }));

// Lưu điểm rèn luyện mới
// Lưu điểm rèn luyện mới hoặc cập nhật nếu đã tồn tại
router.post(
  "/",
  async (req, res) => {
    try {
      const data = req.body;
      if (data && data.user && data.schoolYear && data.semester) {
        // Tìm và cập nhật hoặc tạo mới
        const updatedDoc = await DetailTrainingPointModel.findOneAndUpdate(
          {
            user: data.user,
            schoolYear: data.schoolYear,
            semester: data.semester
          }, // Điều kiện tìm kiếm
          data, // Dữ liệu để cập nhật
          { new: true, upsert: true, setDefaultsOnInsert: true } // Tùy chọn
        );

        if (updatedDoc) {
          return res.status(201).json({
            success: true,
            status: 'success',
            message: "Nộp phiếu điểm thành công.",
            doc: updatedDoc
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Vui lòng cung cấp dữ liệu, người dùng, năm học và học kỳ.',
        });
      }
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

router.delete(
  "/:id",
  $(async (req, res) => {
    const id = req.params.id;
    if (id) {
      const result = await DetailTrainingPointModel.deleteOne({ _id: id }).catch(
        (error) => {
          console.error("Error: ", error);
          return null;
        }
      );

      if (result && result.deletedCount) {
        return res.json({
          success: true,
          status: "success",
          message: "Xóa hoàn tất.",
        });
      }
    }

    return res.json({ success: false });
  })
);


module.exports = router;
