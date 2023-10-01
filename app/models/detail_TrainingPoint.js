const mongoose = require("mongoose");

const schema = new mongoose.Schema({
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
});

schema.set("timestamps", true);

module.exports = mongoose.model("detailTrainingPoint", schema);
