const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema({
  className: { type: String },
  studentCode: { type: String },
  fullName: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  semester: String,
  schoolYear: String,
  isComplete: { type: Boolean, default: false },
});

statisticSchema.set("timestamps", true);

const Statistic = mongoose.model("Statistic", statisticSchema);

module.exports = Statistic;