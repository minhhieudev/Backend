const db = {};

db.user = require("./user");
db.file = require('./file');
db.setting = require('./setting');
db.comment = require('./Comment');

db.answer = require("./answer");
db.question = require('./question');
db.training_point = require("./training_point");
db.result_TrainingPoint = require("./result_TrainingPoint");
db.detail_TrainingPoint = require("./detail_TrainingPoint");
db.infor_TrainingPoint = require("./infor_TrainingPoint");



module.exports = db;