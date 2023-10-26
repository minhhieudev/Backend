const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  attachmentPath: [{
    filename: { type: String },
    path: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, // Đặt kiểu dữ liệu là số nguyên
  privacy: { type: String, enum: ["public", "private"], default: "public" }, // Công khai hoặc riêng tư
}, { timestamps: true });

module.exports = mongoose.model("post", postSchema);
