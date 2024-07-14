const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "post";
const PostModel = db[modelName];
const path = require("path");
const fs = require("fs");

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

router.get(
  "/paginated",
  $(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;

      const total = await PostModel.countDocuments({});
      const totalPages = Math.ceil(total / pageSize);

      const posts = await PostModel.find({})
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
          posts,
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
    console.log(__dirname)
    const id = req.params.id;
    if (id) {
      try {
        // Tìm bài đăng và lấy đường dẫn của các tệp đính kèm
        const post = await PostModel.findById(id);
        if (!post) {
          return res.json({ success: false, error: "Bài đăng không tồn tại." });
        }

        const attachments = post.attachmentPath;

        // Xóa các tệp đính kèm
        if (attachments && attachments.length > 0) {
          attachments.forEach((attachment) => {
            const filePath = path.join(__dirname, '../../../public', attachment.path);
            console.log(filePath)
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Lỗi khi xóa tệp: ", err);
              }
            });
          });
        }

        // Xóa bài đăng
        const result = await PostModel.deleteOne({ _id: id });

        if (result && result.deletedCount) {
          return res.json({
            success: true,
            status: "success",
            message: "Xóa hoàn tất.",
          });
        } else {
          return res.json({
            success: false,
            error: "Không thể xóa bài đăng.",
          });
        }
      } catch (error) {
        console.error("Error: ", error);
        return res.json({
          success: false,
          error: "Lỗi khi xóa bài đăng.",
        });
      }
    }

    return res.json({ success: false, error: "ID bài đăng không hợp lệ." });
  })
);

router.post(
  "/updatePost/:id",
  $(async (req, res) => {
    try {
      const postId = req.params.id;
      const updatedData = req.body.newPost; 

      if (!updatedData || !updatedData.title || !updatedData.content) {
        return res.status(400).json({
          success: false,
          error: "Vui lòng cung cấp đầy đủ dữ liệu bài đăng cần cập nhật.",
        });
      }

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $set: updatedData },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({
          success: false,
          error: "Bài đăng không tồn tại hoặc không thể cập nhật.",
        });
      }

      res.json({
        success: true,
        status: 'success',
        message: "Cập nhật bài đăng thành công.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Lỗi khi cập nhật bài đăng.",
      });
    }
  })
);



module.exports = router;
