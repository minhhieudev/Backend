const mongoose = require("mongoose");

let FileSchema = new mongoose.Schema({
  filename: String
})

FileSchema.set('timestamps', true);

const FileModel = mongoose.model(
    "file",
    FileSchema
);

module.exports = FileModel;