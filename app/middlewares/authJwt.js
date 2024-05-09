const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403);
        //return res.status(403).send({ code: 'error', message: "Bạn không có quyền truy cập" });
    }

    jwt.verify(token, _APP_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ code: 'error', message: "Bạn không có quyền truy cập" });
        }
        req.userId = decoded.id;
        next();
    });
};

verifyRoleAdmin = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ code: 'error', message: "Bạn không có quyền truy cập" });
    }

    jwt.verify(token, _APP_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ code: 'error', message: "Bạn không có quyền truy cập." });
        }
        var userId = decoded.id;
        req.userId = userId;
        User.findById(userId)
            .exec((err, user) => {
                req.user = user
                next();
            });
    });
};

const authJwt = {
    verifyToken,
    verifyRoleAdmin
};
module.exports = authJwt;