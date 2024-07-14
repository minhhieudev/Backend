const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  //isShow: { type: Boolean, default: false },
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

});

schema.set("timestamps", true);

module.exports = mongoose.model("training_point", schema);
