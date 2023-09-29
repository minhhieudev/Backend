const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String },
  content: { type: String, default: "Không có tiêu đề" },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  photoURL: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, // Đặt kiểu dữ liệu là số nguyên
  comments: { type: Number, default: 0 }, // Đặt kiểu dữ liệu là số nguyên
  answers: [{ type: mongoose.Types.ObjectId, ref: "answer" }],
  status: { type: Boolean, default: false },
  privacy: { type: String, enum: ["public", "private"], default: "public" }, // Công khai hoặc riêng tư
});

schema.set("timestamps", true);

module.exports = mongoose.model("question", schema);
