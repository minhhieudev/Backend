const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "student";
const StudentModel = db[modelName];




router.get(
  "/",
  $(async (req, res) => {
    try {
      let filter = {};


      const students = await StudentModel.find();

      return res.json({ success: true, students });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu hỏi.",
      });
    }
  })
);

module.exports = router;
