const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  student: { type: mongoose.Types.ObjectId, ref: "student" },
  selfAssessment: Number,
  groupAssessment: Number,
  user: { type: mongoose.Types.ObjectId, ref: "user" },
});

// Đặt timestamps để tự động tạo createdAt và updatedAt cho mỗi bản ghi
studentSchema.set("timestamps", true);

module.exports = mongoose.model("training_points", studentSchema);
