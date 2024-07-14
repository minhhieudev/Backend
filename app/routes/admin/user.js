const express = require('express');
const app = express();
const $ = require('../../middlewares/safe-call')
const modelName = 'user'
const UserModel = db[modelName];
const StudentModel = db["student"];
const ConsultantModel = db["consultant"];
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs")
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

app.get("/getInfoUser/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Tìm thông tin người dùng dựa trên ID
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return res.json({ success: false, error: "Không tìm thấy người dùng." });
    }

    // Tìm thông tin sinh viên và tư vấn viên dựa trên email của người dùng
    const student = await StudentModel.findOne({ email: user.email }).exec();
    const consultant = await ConsultantModel.findOne({ email: user.email }).exec();

    // Tạo đối tượng trả về kết hợp thông tin người dùng, sinh viên và tư vấn viên
    const doc = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      studentInfo: student || null,
      consultantInfo: consultant || null,
    };

    // Trả về phản hồi thành công
    return res.json({ success: true, doc });
  } catch (error) {
    console.error("Lỗi: ", error);
    return res.json({
      success: false,
      error: "Không thể lấy thông tin chi tiết của người dùng.",
    });
  }
});


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

    // Tìm user theo ID và chờ kết quả
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }

    const oldUrl = user.avatarUrl;
    console.log('User avatar URL:', oldUrl);

    // Cập nhật avatarUrl trong MongoDB
    user.avatarUrl = newUrl;
    await user.save();

    // Chỉ lấy phần sau "uploads/"
    const relativePath = oldUrl.split('uploads/')[1];
    const filePath = path.join(__dirname, '../../../public/uploads',relativePath);


    // Xóa ảnh cũ nếu có
    if (oldUrl && relativePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Lỗi khi xóa ảnh: ", err);
        } else {
          console.log('Ảnh cũ đã được xóa thành công');
        }
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Lỗi khi cập nhật avatar:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});
app.post('/updateNotificationForUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const notificationList = req.body.notifications;


    // Kiểm tra nếu notificationList không phải là một mảng thì trả về lỗi
    if (!Array.isArray(notificationList)) {
      return res.status(400).json({ success: false, message: 'Danh sách thông báo không hợp lệ.' });
    }

    // Cập nhật mảng notifications của người dùng
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { notifications: notificationList },
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi cập nhật notifications:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});
app.get("/getNotification/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Lấy thông báo của người dùng cụ thể
    const user = await UserModel.findById(userId).select('notifications');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    return res.json({ success: true, notifications: user.notifications });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      error: "Không thể lấy thông báo.",
    });
  }
});

app.post('/addNotification/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId)

    const newNotification = req.body.notification;

    // Cập nhật mảng notifications của người dùng
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { notifications: newNotification } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi thêm thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});

// Cập nhật trạng thái đã xem cho tất cả thông báo của người dùng
app.post("/updateNotificationStatus/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Cập nhật trạng thái đã xem cho tất cả thông báo
    user.notifications.forEach((notification) => {
      notification.viewed = true;
    });

    // Lưu người dùng đã được cập nhật
    await user.save();

    res.json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.post('/changePassword/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body.currentPassword;
    console.log(req.body)

    // Tìm user theo ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }

    // Kiểm tra mật khẩu hiện tại
    if (typeof currentPassword !== 'string' || typeof user.password !== 'string') {
      return res.status(400).json({ success: false, message: 'Định dạng mật khẩu không hợp lệ.' });
    }

    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    // Mã hóa mật khẩu mới
    user.password = newPassword;

    // Lưu cập nhật vào MongoDB
    await user.save();

    return res.json({ success: true, message: 'Thay đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi khi thay đổi mật khẩu:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});


module.exports = app;
