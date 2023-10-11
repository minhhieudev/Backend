const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "consultant";
const ConsultantModel = db[modelName];




router.get(
  "/",
  $(async (req, res) => {
    try {
      let filter = {};


      const consultants = await ConsultantModel.find();

      return res.json({ success: true, consultants });
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
