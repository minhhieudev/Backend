const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
});

// Virtual populate để liên kết với mô hình student qua trường email
userSchema.virtual("student", {
  ref: "student",  // Tên của mô hình student
  localField: "email",
  foreignField: "email",
  justOne: true,
});

const User = mongoose.model("user", userSchema);

module.exports = User;
