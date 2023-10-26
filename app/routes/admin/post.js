const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "post";
const PostModel = db[modelName];


// Custom routes
router.get(
  "/status-list",
  $(async (req, res) => {
     const doc = "X";; // Ensure that STATUS_LABEL is defined in QuestionModel
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

      // Add logic to filter the list of questions (if needed)

      const posts = await PostModel.find(filter)
        .populate({ path: "user", select: "fullname" });

      return res.json({ success: true, posts });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Unable to fetch the list of questions.",
      });
    }
  })
);

router.get(
  "/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const question = await PostModel.findById(questionId)
        .populate({ path: "user", select: "fullname" })
        .populate({ path: "answers", select: "content" });

      if (!question) {
        return res.json({ success: false, error: "Question not found." });
      }

      return res.json({ success: true, question });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Unable to fetch the details of the question.",
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

        const createdPost = await PostModel.create(data);

        if (createdPost) {
          // Nếu tạo mới câu hỏi thành công, trả về thông tin câu hỏi vừa tạo
          return res.json({
            success: true,
            post: createdPost,
            message: "Tạo mới bài đăng.",
          });
        } else {
          return res.json({
            success: false,
            error: "Không thể tạo mới bài đăng.",
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
  "/:id",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;

      // Cập nhật giá trị likes cho câu hỏi dựa trên ID
const updatedQuestion = await PostModel.findOneAndUpdate(
  { _id: questionId },
  { $inc: { likes: 1 } },
  { new: true }
);


      if (!updatedQuestion) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      res.json(updatedQuestion); // Gửi lại tài liệu đã cập nhật cho người dùng
    } catch (err) {
      console.error(err); // In ra lỗi
      res.status(500).json(err); // Gửi lại lỗi cho người dùng
    }
  })
);
router.post(
  "/:id/count",
  $(async (req, res) => {
    try {
      const questionId = req.params.id;
      const answersCount = req.body.answersCount; 

      // Cập nhật giá trị comments cho câu hỏi dựa trên ID và giá trị answersCount
      const updatedQuestion = await PostModel.findOneAndUpdate(
        { _id: questionId },
        { $set: { comments: answersCount } }, // Sử dụng $set để cập nhật giá trị comments
        { new: true }
      );


      if (!updatedQuestion) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      res.json(updatedQuestion); // Gửi lại tài liệu đã cập nhật cho người dùng
    } catch (err) {
      console.error(err); // In ra lỗi
      res.status(500).json(err); // Gửi lại lỗi cho người dùng
    }
  })
);




router.delete(
  "/:id",
  $(async (req, res) => {
    const id = req.params.id;
    if (id) {
      const result = await PostModel.deleteOne({ _id: id }).catch(
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
