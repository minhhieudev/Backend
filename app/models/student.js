const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    studentCode: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    fullName: { type: String },
    className: { type: String },
    department: { type: String},
    dateOfBirth: { type: Date },

});

schema.set("timestamps", true);

module.exports = mongoose.model("student", schema);
