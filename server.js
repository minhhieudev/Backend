const express = require("express");
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const logger = require('morgan');
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
require('dotenv').config()
const methods = require('./app/helpers/methods')
global._APP_SECRET = process.env.SECRET || 'secret'
global.getCollection = methods.getCollection
global.globalConfig = {}
const db = require("./app/models");
global.db = db
global.APP_DIR = __dirname

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect to mongo
// let monoPath = `mongodb+srv://kimtrongdev2:HUYyfu1ovSqkxJde@cluster0.vawtbzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
if (process.env.MONGO_URL) {
    monoPath = `mongodb://${process.env.MONGO_URL || 'localhost:27017'}/${process.env.MONGO_NAME || 'wl-test'}`
}
mongoose.connect(monoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Đã kết nối tới Mongodb.");
}).catch(err => {
    console.error("Connection error", err);
    process.exit();
});

// routes
app.use("/upload", express.static('public'));
app.use('/api/v1/admin', require('./app/routes/admin'));
app.use('*', (req, res) => {
    res.json({ status: 'error', msg: 'Not Route, call admin' });
});

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.use(logger('dev'));

async function init() {
    let settings = await db.setting.find()
    settings.forEach(setting => {
        globalConfig[setting.key] = setting.data
    });

    let adminDefaultUser = await db.user.findOne({ email: 'admin@gmail.com' })
    if (!adminDefaultUser) {
        db.user.create({ fullname: 'Admin', role: 'admin', email: 'admin@gmail.com', password: bcrypt.hashSync('123123qq@', 8) })
    }
}

app.listen(PORT, async () => {
    init()
    console.log(`Server is running on port ${PORT}.`);
});