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
      const answers = await AnswerModel.find({}).populate({
        path: "user",
        select: "fullname avatarUrl",
      });
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
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        });
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
        const createdAnswer = await AnswerModel.create(data);

        if (createdAnswer) {
          return res.json({
            success: true,
            status: 'success',
            answer: createdAnswer,
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

router.post(
  "/:id",
  $(async (req, res) => {
    try {
      const answerId = req.params.id;

      const updatedAnswer = await AnswerModel.findOneAndUpdate(
        { _id: answerId },
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!updatedAnswer) {
        return res
          .status(404)
          .json({ success: false, error: "Câu trả lời không tồn tại." });
      }

      res.json(updatedAnswer);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
);

router.delete("/deleteAnswer/:id", $(async (req, res) => {
  const id = req.params.id
  console.log(id)
  if (id) {
    const result = await AnswerModel.deleteMany({ question: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success' })
    }
  }

  return res.json({ success: false })
}))

router.delete("/deleteReply/:id", $(async (req, res) => {
  const id = req.params.id
  if (id) {
    const result = await ReplyModel.deleteMany({ post: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success' })
    }
  }

  return res.json({ success: false })
}))

module.exports = router;
