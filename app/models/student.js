const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    studentCode: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    className: { type: String, required: true },
    department: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }

});

schema.set("timestamps", true);

module.exports = mongoose.model("student", schema);
