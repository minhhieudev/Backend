const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    studentCode: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    className: { type: String, required: true },
    department: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
});

Schema.set("timestamps", true);

const student = mongoose.model("student", Schema);

module.exports = student;
