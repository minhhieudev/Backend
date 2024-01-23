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

router.get("/", async (req, res) => {
  try {
    let filter = {};

    const posts = await PostModel.find(filter)
      .populate({
        path: "user",
        select: "fullname avatarUrl",
      });

    return res.json({ success: true, posts });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy bài đăng",
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostModel.findById(postId)
      .populate({
        path: "user",
        select: "fullname avatarUrl",
      })
      .populate({ path: "answers", select: "content" });

    if (!post) {
      return res.json({ success: false, error: "Post not found." });
    }

    return res.json({ success: true, post });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Unable to fetch the details of the post.",
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

        const createdPost = await PostModel.create(data);

        if (createdPost) {
          // Nếu tạo mới câu hỏi thành công, trả về thông tin câu hỏi vừa tạo
          return res.json({
            success: true,
            status: 'success',
            message: "Tạo mới bài đăng.",
          });
        } else {
          return res.json({
            success: false,
            status: 'error',
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

// router.post(
//   "/:id",
//   $(async (req, res) => {
//     try {
//       const questionId = req.params.id;

//       // Cập nhật giá trị likes cho câu hỏi dựa trên ID
// const updatedQuestion = await PostModel.findOneAndUpdate(
//   { _id: questionId },
//   { $inc: { likes: 1 } },
//   { new: true }
// );


//       if (!updatedQuestion) {
//         return res
//           .status(404)
//           .json({ success: false, error: "Câu hỏi không tồn tại." });
//       }

//       res.json(updatedQuestion); // Gửi lại tài liệu đã cập nhật cho người dùng
//     } catch (err) {
//       console.error(err); // In ra lỗi
//       res.status(500).json(err); // Gửi lại lỗi cho người dùng
//     }
//   })
// );
router.post(
  "/:id/count",
  $(async (req, res) => {
    try {
      const postId = req.params.id;
      const postsCount = req.body.answersCount;

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $set: { comments: postsCount } },
        { new: true }
      );

      if (!updatedPost) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }

      res.json(updatedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
);
router.post(
  "/like/:id",
  $(async (req, res) => {
    try {
      const postId = req.params.id;

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!updatedPost) {
        return res
          .status(404)
          .json({ success: false, error: "Câu hỏi không tồn tại." });
      }
      res.json(updatedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
);


router.post('/updatePinnedStatus/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { pinned } = req.body;

    // Cập nhật trạng thái pinned của bài đăng
    const updatedPost = await PostModel.findByIdAndUpdate(postId, { pinned }, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng.' });
    }

    return res.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái pinned:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});

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
