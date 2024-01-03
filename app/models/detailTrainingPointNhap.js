const mongoose = require("mongoose");

const detailTrainingPointNhapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  semester: String,
  schoolYear: String,
  status: { type: Boolean, default: false },
  criteriaList: [
    {
      stt: String,
      criteria: String, 
      content: [
        {
          text: String,
          maxScore: Number,
          selfAssessment: Number,
          groupAssessment: Number,
          consultantAssessment: Number,
        },
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