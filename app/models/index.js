const db = {};

db.user = require("./user");
db.setting = require('./setting');

db.answer = require("./answer");
db.reply = require("./reply");
db.question = require('./question');
db.training_point = require("./training_point");
db.result_TrainingPoint = require("./result_TrainingPoint");
db.detailTrainingPoint = require("./detailTrainingPoint");
db.detailTrainingPointNhap = require("./detailTrainingPointNhap");
db.student = require("./student");
db.consultant = require("./consultant");
db.post = require("./post");
db.notification = require("./notification");



module.exports = db;