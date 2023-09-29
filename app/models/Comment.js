const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  content: { type: String },
  user: { type: mongoose.Types.ObjectId, ref: 'user' },
  medias: [{ type: String }],
  task: { type: mongoose.Types.ObjectId, ref: 'task' },
})

schema.set('timestamps', true);

module.exports = mongoose.model(
  "comment",
  schema
)
