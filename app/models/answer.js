const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  content: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  question: { type: mongoose.Types.ObjectId, ref: "question" },
  photoURL: { type: String },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, // Đặt kiểu dữ liệu là số nguyên
});

schema.set("timestamps", true);

module.exports = mongoose.model("answer", schema);
