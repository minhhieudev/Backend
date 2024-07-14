const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  email: { type: String, required: true },
  avatarUrl: { type: String, default: `${process.env.VUE_APP_BACKEND_URL}/uploads/1713711775323-huhu.jpg` },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  notifications: [
    {
      user: {
        _id: String,
        fullname: String,
        avatarUrl: String,
      },
      content: String,
      createdAt: { type: Date, default: Date.now },
      viewed: { type: Boolean, default: false },
    }
  ]
});

// Virtual populate để liên kết với mô hình student qua trường email
userSchema.virtual("student", {
  ref: "student",  // Tên của mô hình student
  localField: "email",
  foreignField: "email",
  justOne: true,
});

// Thêm virtual populate cho tư vấn viên
userSchema.virtual("consultant", {
  ref: "consultant",  // Thay thế "consultant" bằng tên của mô hình tư vấn viên
  localField: "email",
  foreignField: "email",
  justOne: true,
});

// Pre-save hook để mã hóa mật khẩu trước khi lưu

const User = mongoose.model("user", userSchema);

module.exports = User;
