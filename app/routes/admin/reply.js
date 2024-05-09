const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "reply";
const ReplyModel = db[modelName];


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
      const reply = await ReplyModel.find({}).populate({
        path: "user",
        select: "fullname avatarUrl",
      });
      return res.json({ success: true, reply });
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
      const replyId = req.params.id;
      console.log(replyId)
      const reply = await ReplyModel.find({ post: replyId })
        .populate("post")
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        });
      return res.json({ success: true, reply });
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
        const createdReply = await ReplyModel.create(data);

        if (createdReply) {
          return res.json({
            success: true,
            status: 'success',
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
