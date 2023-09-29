const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "answer";
const AnswerModel = db[modelName];

// Custom routes
router.get(
  "/status-list",
  $(async (req, res) => {
     const doc = "X"; // Đảm bảo rằng STATUS_LABEL được định nghĩa trong AnswerModel
    return res.json({ success: true, doc });
  })
);

// CRUD routes
router.post(
  "/collection",
  $(async (req, res) => {
    const rs = await getCollection(modelName, req.body);
    res.json(rs);
  })
);

router.get(
  "/",
  $(async (req, res) => {
    try {
      // Thêm logic xử lý yêu cầu lấy danh sách câu trả lời ở đây
      const answers = await AnswerModel.find({}).populate("user", "fullname"); // Lấy danh sách câu trả lời và thông tin người tạo câu trả lời
      return res.json({ success: true, answers });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu trả lời.",
      });
    }
  })
);
router.get(
  "/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const answers = await AnswerModel.find({ question: questionId })
        .populate("question")
        .populate({ path: "user", select: "fullname" }); // Lấy thông tin người tạo câu hỏi;

      return res.json({ success: true, answers });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu trả lời.",
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

        const createdAnswer = await AnswerModel.create(data);

        if (createdAnswer) {
          // Nếu tạo mới câu trả lời thành công, trả về thông tin câu trả lời vừa tạo
          return res.json({
            success: true,
            answer: createdAnswer,
            message: "Tạo mới câu trả lời thành công.",
          });
        } else {
          return res.json({
            success: false,
            error: "Không thể tạo mới câu trả lời.",
          });
        }
      } else {
        return res.json({
          success: false,
          error: "Vui lòng cung cấp dữ liệu câu trả lời.",
        });
      }
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể tạo mới câu trả lời.",
      });
    }
  })
);

module.exports = router;
