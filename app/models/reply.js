const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  content: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  post: { type: mongoose.Types.ObjectId, ref: "post" },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }, 
});

schema.set("timestamps", true);

module.exports = mongoose.model("reply", schema);
