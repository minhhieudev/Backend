const express = require('express');
const authJwt = require("../../middlewares/authJwt");
const app = express();

app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

app.use('/auth', require('./auth'));
app.use('/file', require('./file'));

app.use(authJwt.verifyRoleAdmin);
app.use('/user', require('./user'));
app.use('/helper', require('./helper'))
app.use('/setting', require('./setting'))
app.use("/question", require("./question"));
app.use("/answer", require("./answer"));
app.use("/reply", require("./reply"));
app.use('/comment', require('./comment'))
app.use("/training_point", require("./training_point"));
app.use("/result_TrainingPoint", require("./result_TrainingPoint"));
app.use("/detailTrainingPoint", require("./detailTrainingPoint"));
app.use("/detailTrainingPointNhap", require("./detailTrainingPointNhap"));
app.use("/student", require("./student"));
app.use("/consultant", require("./consultant"));
app.use("/post", require("./post"));
app.use("/notification", require("./notification"));
app.use("/search", require("./search"));

module.exports = app;
