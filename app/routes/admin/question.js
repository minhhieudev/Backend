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
  "/paginated",
  $(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;

      const total = await QuestionModel.countDocuments({});
      const totalPages = Math.ceil(total / pageSize);

      const questions = await QuestionModel.find({})
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        })
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      const pagination = {
        total,
        page,
        pageSize,
        totalPages,
      };

      res.status(200).json({
        success: true,
        data: {
          pagination,
          questions,
        },
      });
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({
        success: false,
        error: "Không thể lấy bài đăng",
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


router.post(
  "/updateQuestion/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const updatedData = req.body.newQuestion; // Updated question data

      // Ensure that the required fields are provided
      if (!updatedData || !updatedData.title || !updatedData.content) {
        return res.status(400).json({
          success: false,
          error: "Vui lòng cung cấp đầy đủ dữ liệu câu hỏi cần cập nhật.",
        });
      }

      // Update the question using findOneAndUpdate
      const updatedQuestion = await QuestionModel.findOneAndUpdate(
        { _id: questionId },
        { $set: updatedData },
        { new: true }
      );

      // Check if the question was updated successfully
      if (!updatedQuestion) {
        return res.status(404).json({
          success: false,
          error: "Câu hỏi không tồn tại hoặc không thể cập nhật.",
        });
      }

      // Return the updated question
      res.json({
        success: true,
        status: 'success',
        message: "Cập nhật câu hỏi thành công.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Lỗi khi cập nhật câu hỏi.",
      });
    }
  })
);


module.exports = router;
