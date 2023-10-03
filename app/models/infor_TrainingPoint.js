const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    Point:{
          selfAssessment: Number,
          groupAssessment: Number,
          consultantAssessment: Number,
    },
});

schema.set("timestamps", true);

module.exports = mongoose.model("infor_TrainingPoint", schema);
