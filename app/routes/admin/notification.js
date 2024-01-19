const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "notification";
const NotificationModel = db[modelName];




router.get(
  "/",
  $(async (req, res) => {
    try {
      let filter = {};

      const notifications = await NotificationModel.find(filter)
        .populate({
          path: "user",
          select: "fullname avatarUrl",
        });

      return res.json({ success: true, notifications });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu hỏi.",
      });
    }
  })
);


router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Lấy thông báo chung
    const commonNotifications = await NotificationModel.find(
      { global: true }
    )
    .populate({
      path: "user",
      select: "fullname avatarUrl",
    })
    .sort({ createdAt: -1 });

    // Lấy thông báo riêng của từng user
    const userNotifications = await NotificationModel.find(
      { user: userId, global: false }
    )
    .populate({
      path: "user",
      select: "fullname avatarUrl",
    })
    .sort({ createdAt: -1 });

    // Kết hợp thông báo chung và thông báo riêng
    const allNotifications = [...commonNotifications, ...userNotifications];

    // Sắp xếp mảng kết quả theo thời gian giảm dần
    allNotifications.sort((a, b) => b.createdAt - a.createdAt);

    return res.json({ success: true, notifications: allNotifications });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy thông báo.",
    });
  }
});

// router.get(
//   "/:id",
//   $(async (req, res) => {
//     try {
//       const questionId = req.params.id;
//       const question = await NotificationModel.findById(questionId)
//         .populate({
//           path: "user",
//           select: "fullname avatarUrl",
//         })
//         .populate({ path: "answers", select: "content" });

//       if (!question) {
//         return res.json({ success: false, error: "Câu hỏi không tồn tại." });
//       }

//       return res.json({ success: true, notifications });
//     } catch (error) {
//       console.error("Error: ", error);
//       return res.json({
//         success: false,
//         error: "Không thể lấy chi tiết câu hỏi.",
//       });
//     }
//   })
// );


router.post(
  "/",
  $(async (req, res) => {
    try {
      const data = req.body;

      if (data) {

        const createdNotification = await NotificationModel.create(data);

        if (createdNotification) {
          return res.json({
            success: true,
            status: 'success',
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


router.delete(
  "/:id",
  $(async (req, res) => {
    const id = req.params.id;
    if (id) {
      const result = await NotificationModel.deleteOne({ _id: id }).catch(
        (error) => {
          console.error("Error: ", error);
          return null;
        }
      );

      if (result && result.deletedCount) {
        return res.json({
          success: true,
          status: "success",
        });
      }
    }

    return res.json({ success: false });
  })
);

module.exports = router;
