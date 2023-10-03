const db = {};

db.user = require("./user");
db.file = require('./file');
db.setting = require('./setting');
db.comment = require('./Comment');

db.answer = require("./answer");
db.question = require('./question');
db.training_point = require("./training_point");
db.result_TrainingPoint = require("./result_TrainingPoint");
db.detailTrainingPoint = require("./detailTrainingPoint");
db.infor_TrainingPoint = require("./infor_TrainingPoint");
db.student = require("./student");



module.exports = db;