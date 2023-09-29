const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  data: { type: Object },
  key: String
})

schema.set('timestamps', true);

const model = mongoose.model(
    "setting",
    schema
);

module.exports = model;
