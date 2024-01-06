const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "question";
const QuestionModel = db[modelName];

// Custom routes
router.get(
  "/status-list",
  $(async (req, res) => {
    const doc = "X";
    return res.json({ success: true, doc });
  })
);
router.post(
  "/collection",
  $(async (req, res) => {
    req.body.populate = { path: "user", select: "fullname" };
    const rs = await getCollection(modelName, req.body);
    res.json(rs);
  })
);



router.get(
  "/",
  $(async (req, res) => {
    try {
      let filter = {};


      const questions = await QuestionModel.find(filter)
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        });

      return res.json({ success: true, questions });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu hỏi.",
      });
    }
  })
);


router.get(
  "/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const question = await QuestionModel.findById(questionId)
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        })
        .populate({ path: "answers", select: "content" });

      if (!question) {
        return res.json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      return res.json({ success: true, question });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy chi tiết câu hỏi.",
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

        const createdQuestion = await QuestionModel.create(data);

        if (createdQuestion) {
          return res.json({
            success: true,
            status: 'success',
            question: createdQuestion,
            message: "Tạo mới câu hỏi thành công.",
          });
        } else {
          return res.json({
            success: false,
            error: "Không thể tạo mới câu hỏi.",
          });
        }
      } else {
        return res.json({
          success: false,
          error: "Vui lòng cung cấp dữ liệu câu hỏi.",
        });
      }
    } catch (error) {
      console.error("Error: ", error);
      return res.json({ success: false, error: "Không thể tạo mới câu hỏi." });
    }
  })
);

router.post(
  "/status/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;

      await QuestionModel.updateOne({ _id: questionId }, { $set: { status: true } });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating status: ", error);
      res.json({ success: false, error: "Error updating status." });
    }
  })
);

router.post(
  "/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;

      const updatedQuestion = await QuestionModel.findOneAndUpdate(
        { _id: questionId },
        { $inc: { likes: 1 } },
        { new: true }
      );


      if (!updatedQuestion) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      res.json(updatedQuestion);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
);
router.post(
  "/:id/count",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const answersCount = req.body.answersCount;

      const updatedQuestion = await QuestionModel.findOneAndUpdate(
        { _id: questionId },
        { $set: { comments: answersCount } },
        { new: true }
      );


      if (!updatedQuestion) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      res.json(updatedQuestion);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
);


router.delete(
  "/:id",
  $(async (req, res) => {
    const id = req.params.id;
    if (id) {
      const result = await QuestionModel.deleteOne({ _id: id }).catch(
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
