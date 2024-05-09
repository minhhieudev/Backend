const express = require("express");
const router = express.Router();
const $ = require("../../middlewares/safe-call");
const modelName = "student";
const StudentModel = db[modelName];



// Route trả về tên lớp và danh sách sinh viên của lớp đó
router.get("/getStudentForClass", async (req, res) => {
  try {
    // Lấy danh sách tất cả các lớp trong cơ sở dữ liệu
    const classNames = await StudentModel.distinct("className");

    // Tạo danh sách hứa hẹn cho mỗi lớp
    const promises = classNames.map(async className => {
      // Tìm tất cả sinh viên trong lớp hiện tại
      // Đảm bảo truy vấn đúng trường className, và loại bỏ _id và className
      const listStudents = await StudentModel.find()
      .where('className').equals(className)
      .select('-_id -className');
  


      // Trả về thông tin lớp và danh sách sinh viên
      return {
        className,
        listStudents,
      };
    });

    // Chờ tất cả các hứa hẹn hoàn thành
    const result = await Promise.all(promises);

    // Trả về danh sách kết quả dưới dạng JSON
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error: ", error);
    res.json({ success: false, error: "Không thể lấy danh sách lớp và sinh viên." });
  }
});

router.get(
  "/",
  $(async (req, res) => {
    try {
      let filter = {};


      const students = await StudentModel.find();

      return res.json({ success: true, students });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({
        success: false,
        error: "Không thể lấy danh sách câu hỏi.",
      });
    }
  })
);

router.get("/class-list", async (req, res) => {
  try {
    const classLists = await StudentModel.distinct("className");

    return res.json({ success: true, classLists });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy danh sách lớp học.",
    });
  }
});
router.post(
  "/updateIsComplete",
  async (req, res) => {
    try {
      // Tìm tất cả sinh viên trong cơ sở dữ liệu
      const students = await StudentModel.find();
      
      // Kiểm tra nếu không có sinh viên nào
      if (students.length === 0) {
        return res.json({ success: false, error: "Không tìm thấy sinh viên nào để cập nhật." });
      }
      
      for (const student of students) {
        student.isComplete = false; // Đảo ngược giá trị của isComplete
        await student.save(); // Lưu lại thay đổi
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Error: ", error);
      return res.json({ success: false });
    }
  }
);
router.post(
  "/updateIsCompleteId",
  async (req, res) => {
    try {
      const {id} = req.query
      const student = await StudentModel.findById(id);

      if (!student) {
        return res.json({ success: false, error: "Không tìm thấy sinh viên với ID đã cung cấp." });
      }
      student.isComplete = true;

      await student.save();

      return res.json({ success: true});
    } catch (error) {
      console.error("Error: ", error);
      return res.json({ success: false });
    }
  }
);

router.get("/khoaList", async (req, res) => {
  try {
    const khoaLists = await StudentModel.distinct("department");

    return res.json({ success: true, khoaLists });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy danh sách khoa.",
    });
  }
});

router.get("/nganhList", async (req, res) => {
  try {
    const nganhLists = await StudentModel.distinct("majors");

    return res.json({ success: true, nganhLists });
  } catch (error) {
    console.error("Error: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy danh sách nganh.",
    });
  }
});

router.get(
  "/get-fullName/:email",
  $(async (req, res) => {
    try {
      const email = req.params.email; // Chuyển đổi thành chuỗi
      console.log(email)
      if (!email) {
        return res.json({
          success: false,
          error: "Vui lòng cung cấp địa chỉ email.",
        });
      }

      const student = await StudentModel.findOne({ email: email });

      if (!student) {
        return res.json({
          success: false,
          error: "Không tìm thấy sinh viên với địa chỉ email sinh viên đã cung cấp.",
        });
      }

      const fullName = student.fullName;

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


router.get("/:id", $(async (req, res) => {

  const id = req.params.id;
  if (id) {
    const doc = await StudentModel.findOne({ _id: id }).catch(error => {
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
      const updatedDoc = await StudentModel.updateOne({ _id: data._id }, data).catch(error => {
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
      const createdDoc = await StudentModel.create(data).catch(error => {
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
    const result = await StudentModel.deleteOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success', message: 'Xóa hoàn tất.' })
    }
  }

  return res.json({ success: false })
}))








module.exports = router;



module.exports = router;
