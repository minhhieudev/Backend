const express = require('express');
const app = express();
const $ = require('../../middlewares/safe-call')
const modelName = 'user'
const UserModel = db[modelName];
const StudentModel = db["student"];
const ConsultantModel = db["consultant"];
const bcrypt = require("bcryptjs");

// app.post(
//   "/collection",
//   $(async (req, res) => {
//     const { role, ...otherParams } = req.body; // Lấy tham số role từ frontend

//     let filter = {};
//     // Kiểm tra nếu có tham số role thì thêm bộ lọc theo vai trò
//     if (role) {
//       filter.role = role;
//     }

//     const docs = await UserModel.find(filter, "-password").catch((error) => {
//       console.error("Error: ", error);
//       return [];
//     });

//     return res.json({ success: true, docs });
//   })
// );

app.post("/collection", async (req, res) => {

  try {
    // Lấy danh sách người dùng
    const users = await UserModel.find({}).exec();

    // Lấy danh sách sinh viên dựa trên email
    const userEmails = users.map(user => user.email);
    const students = await StudentModel.find({ email: { $in: userEmails } }).exec();

    // Lấy danh sách tư vấn viên dựa trên email
    const consultants = await ConsultantModel.find({ email: { $in: userEmails } }).exec();

    // Kết hợp thông tin người dùng, sinh viên, và tư vấn viên
    const docs = users.map(user => {
      const student = students.find(student => student.email === user.email);
      const consultant = consultants.find(consultant => consultant.email === user.email);
      return {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentInfo: student || null,
        consultantInfo: consultant || null,
      };
    });

    return res.json({ success: true, docs });
  } catch (error) {
    console.error("Lỗi: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy thông tin sinh viên và tư vấn viên cho người dùng.",
    });
  }
});







app.get("/:id", $(async (req, res) => {

  const id = req.params.id
  if (id) {
    const doc = await UserModel.findOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (doc) {
      return res.json({ success: true, doc })
    }
  }

  return res.json({ success: false, doc: null })
}))

app.post("/", $(async (req, res) => {
  const data = req.body
  if (data) {
    if (data._id) {
      // update
      // TODO - validate
      const updatedDoc = await UserModel.updateOne({ _id: data._id }, data).catch(error => {
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
      data.password = bcrypt.hashSync(data.password, 8)
      const createdDoc = await UserModel.create(data).catch(error => {
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

app.delete("/:id", $(async (req, res) => {

  const id = req.params.id
  if (id) {
    const result = await UserModel.deleteOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success', message: 'Xóa hoàn tất.' })
    }
  }

  return res.json({ success: false })
}))


app.post('/updateAvatarUser/:id', async (req, res) => {

  try {
    const userId = req.params.id;
    const newUrl = req.body.avatarUrl.newUrl; // Truy xuất giá trị avatarUrl trực tiếp từ client

    // Kết hợp newUrl với /upload/

    console.log(newUrl);

    // Cập nhật avatarUrl trong MongoDB
    const avatarUrl = await UserModel.findByIdAndUpdate(userId, { avatarUrl: newUrl }, { new: true });

    if (!avatarUrl) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }

    return res.json({ success: true, user: avatarUrl });
  } catch (error) {
    console.error('Lỗi khi cập nhật avatar:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});

module.exports = app;
