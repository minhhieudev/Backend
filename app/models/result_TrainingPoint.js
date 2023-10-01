const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  semester: String,
  schoolYear: String,
  Point: {
    selfAssessment: { type: Number, default: 0 },
    groupAssessment: { type: Number, default: 0 },
    consultantAssessment: { type: Number, default: 0 },
  },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
});

Schema.set("timestamps", true);

module.exports = mongoose.model("result_TrainingPoint", Schema);
