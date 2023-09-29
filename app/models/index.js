const db = {};

db.user = require("./user");
db.file = require('./file');
db.setting = require('./setting');
db.comment = require('./Comment');

db.answer = require("./answer");
db.question = require('./question');
db.training_point = require("./training_point");



module.exports = db;