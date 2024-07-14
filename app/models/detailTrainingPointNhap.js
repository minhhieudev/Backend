const mongoose = require("mongoose");

const detailTrainingPointNhapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  semester: String,
  schoolYear: String,
  department: { type: String},
  className: { type: String },
  status: { type: Boolean, default: false },
  criteriaList: [
    {
      stt: String,
      criteria: {
        text: String,
        selfAssessment: Number,
        groupAssessment: Number,
        consultantAssessment: Number,
      },
      content: [
        {
          text: String,
          maxScore: Number,
        }
      ],
    },
  ],
  Total_selfAssessment: Number,
  Total_groupAssessment: Number,
  Total_consultantAssessment: Number,
});

detailTrainingPointNhapSchema.set("timestamps", true);

const DetailTrainingPointNhap = mongoose.model("detailTrainingPointNhap", detailTrainingPointNhapSchema);

module.exports = DetailTrainingPointNhap;