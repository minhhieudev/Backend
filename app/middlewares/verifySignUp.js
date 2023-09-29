const db = require("../models");
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ msg: err });
            return;
        }
        if (user) {
            res.status(400).send({ code: 'error', msg: { msg: "Email này đã được sử dụng", param: "email" } });
            return;
        }
        next();
    });
};

const verifySignUp = {
    checkDuplicateEmail
};

module.exports = verifySignUp;