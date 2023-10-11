const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  schoolYear: String,
  semester1: {
    point: String,
    classify: String,
    note: String
  },
  semester2: {
    point: String,
    classify: String,
    note: String
  },
  wholeYear: {
    point: String,
    classify: String,
    note: String
  },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
});

Schema.set("timestamps", true);

module.exports = mongoose.model("result_TrainingPoint", Schema);
