const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    fullname: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    address: {
        home: { type: String, default: null },
        ward: { type: String, default: null },
        district: { type: String, default: null },
        city: { type: String, default: null },
    },
    role: { type: String, default: 'user' },
    status: { type: Boolean, default: true },
    avatar: { type: String },
})

schema.set('timestamps', true);
schema.statics.ROLES = {
    ADMIN: 'admin',
    LEADER: 'leader',
    EMPLOYEE: 'employee',
}
const model = mongoose.model(
    "user",
    schema
);

module.exports = model;
