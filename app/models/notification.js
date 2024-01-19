const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "user" },
  content: String,
  createdAt: { type: Date, default: Date.now },
  viewed: { type: Boolean, default: false },
});

notificationSchema.set("timestamps", true);

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
