const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  MSV: { type: String, required: true, unique: true },
  hoTen: String,
  lop: String,
  khoa: String,
  // Các trường thông tin khác về sinh viên có thể thêm ở đây
});

// Đặt timestamps để tự động tạo createdAt và updatedAt cho mỗi bản ghi
studentSchema.set("timestamps", true);

module.exports = mongoose.model("student", studentSchema);
