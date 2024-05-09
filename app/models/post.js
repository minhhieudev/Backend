const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  attachmentPath: [{
    filename: { type: String },
    path: { type: String }
  }],
  postType: { type: String },
  comments: { type: Number, default: 0 }, 
  replys: [{ type: mongoose.Types.ObjectId, ref: "reply" }],
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, 
  privacy: { type: String, enum: ["public", "private"], default: "public" }, 
}, { timestamps: true });

module.exports = mongoose.model("post", postSchema);
