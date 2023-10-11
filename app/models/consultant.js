const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
});

schema.set("timestamps", true);

module.exports = mongoose.model("consultant", schema);
