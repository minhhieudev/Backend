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


router.get("/:id", $(async (req, res) => {
  const id = req.params.id;
  if (id) {
    const doc = await ConsultantModel.findOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null;
    })

    if (doc) {
      return res.json({ success: true, doc });
    } else {
      return res.json({ success: false, doc: null });
    }
  } else {
    return res.json({ success: false, doc: null });
  }
}))


// router.post(
//   "/",
//   $(async (req, res) => {
//     try {
//       const data = req.body;

//       if (data) {
//         // TODO: Thêm các bước kiểm tra và xác thực dữ liệu đầu vào nếu cần

//         const createdQuestion = await StudentModel.create(data);

//         if (createdQuestion) {
//           // Nếu tạo mới câu hỏi thành công, trả về thông tin câu hỏi vừa tạo
//           return res.json({
//             success: true,
//             student: createdQuestion,
//             message: "Tạo mới sinh viên thành công.",
//           });
//         } else {
//           return res.json({
//             success: false,
//             error: "Không thể tạo mới sinh viên.",
//           });
//         }
//       } else {
//         return res.json({
//           success: false,
//           error: "Vui lòng cung cấp dữ liệu sinh viên.",
//         });
//       }
//     } catch (error) {
//       console.error("Error: ", error);
//       return res.json({ success: false, error: "Không thể tạo mới sinh viên." });
//     }
//   })
// );


router.post("/", $(async (req, res) => {
  const data = req.body
  if (data) {
    if (data._id) {
      // update
      // TODO - validate
      const updatedDoc = await ConsultantModel.updateOne({ _id: data._id }, data).catch(error => {
        console.error('Error:', error);
        return null
      })

      if (updatedDoc) {
        return res.json({ success: true, doc: updatedDoc, status: 'success', message: 'Cập nhật thành công.' })
      } else {
        return res.json({ success: false, status: 'error', message: 'Cập nhật thất bại.' })
      }
    } else {
      // create new
      // TODO - validate
      const createdDoc = await ConsultantModel.create(data).catch(error => {
        console.error('Error:', error);
        return null
      })

      if (createdDoc) {
        return res.json({ success: true, doc: createdDoc, status: 'success', message: 'Tạo mới thành công.' })
      } else {
        return res.json({ success: false, status: 'error', message: 'Tạo mới thất bại.' })
      }
    }
  }
  return res.json({ success: false, status: 'error', message: 'Vui lòng cung cấp dữ liệu.' })
}))



router.delete("/:id", $(async (req, res) => {
  const id = req.params.id
  if (id) {
    const result = await ConsultantModel.deleteOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success', message: 'Xóa hoàn tất.' })
    }
  }

  return res.json({ success: false })
}))
// router.get("/:id", $(async (req, res) => {
//   const id = req.params.id;
//   if (id) {
//     const doc = await ConsultantModel.findOne({ _id: id }).catch(error => {
//       console.error('Error: ', error);
//       return null;
//     })

//     if (doc) {
//       return res.json({ success: true, doc });
//     } else {
//       return res.json({ success: false, doc: null });
//     }
//   } else {
//     return res.json({ success: false, doc: null });
//   }
// }))
router.get(
  "/get-fullName/:email",
  $(async (req, res) => {
    try {
      const email = req.params.email; // Chuyển đổi thành chuỗi

      if (!email) {
        return res.json({
          success: false,
          error: "Vui lòng cung cấp địa chỉ email.",
        });
      }

      const consultant = await ConsultantModel.findOne({ email: email });

      if (!consultant) {
        return res.json({
          success: false,
          error: "Không tìm thấy cố vấn với địa chỉ email đã cung cấp.",
        });
      }

      const fullName = consultant.fullName;

      return res.json({ success: true, fullName });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy tên cố vấn.",
      });
    }
  })
);



module.exports = router;
