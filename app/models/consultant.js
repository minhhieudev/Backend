const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    position:  { type: String },
    mission: { type: String },
    // dateOfBirth: { type: Date, required: true }
});

schema.set("timestamps", true);

module.exports = mongoose.model("consultant", schema);
