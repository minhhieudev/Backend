const mongoose = require("mongoose");

const detailTrainingPointSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  semester: String,
  schoolYear: String,
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

detailTrainingPointSchema.set("timestamps", true);

const DetailTrainingPoint = mongoose.model("detailTrainingPoint", detailTrainingPointSchema);

module.exports = DetailTrainingPoint;