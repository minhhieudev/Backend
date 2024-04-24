const express = require("express");
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const logger = require('morgan');

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*', // Thay đổi địa chỉ của ứng dụng Vue.js của bạn
    methods: ['GET', 'POST'],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  // Lắng nghe sự kiện khi có thông báo mới được tạo
  socket.on("newNotification", async () => {
    

    io.emit("updateNotifications");
  });

  // Ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Đặt thư mục đích cho các tệp đã tải lên
  },
  filename: function (req, file, cb) {
    // Đặt tên tệp cho tệp đã tải lên
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/public/upload", upload.array("file"), (req, res) => {
  const fileData = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/${file.filename}` 
  }));
  // Xử lý tệp đã tải lên, lưu chi tiết của chúng vào cơ sở dữ liệu, v.v.

  // Đặt Access-Control-Allow-Origin trong header của response
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.json({ success: true, message: "Tệp đã được tải lên thành công", files: fileData });
});



const corsOptions = {
  origin: 'http://localhost:8081', 
  optionsSuccessStatus: 200,
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
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// connect to mongo
// let monoPath = `mongodb+srv://kimtrongdev2:HUYyfu1ovSqkxJde@cluster0.vawtbzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

let monoPath = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@nckh.hs2nnk2.mongodb.net/${process.env.MONGO_NAME || 'NCKH'}?retryWrites=true&w=majority&appName=NCKH`;
    
// if (process.env.MONGO_URL) {
//   monoPath = `mongodb://${process.env.MONGO_URL || 'localhost:27017'}/${process.env.MONGO_NAME || 'NCKH'}`
// }

// if (process.env.MONGO_URL) {
//   URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@nckh.hs2nnk2.mongodb.net/${process.env.MONGO_NAME || 'NCKH'}?retryWrites=true&w=majority&appName=NCKH`;

// }

mongoose.connect(monoPath, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Đã kết nối tới Mongodb.");
}).catch(err => {
  console.error("Connection error", err);
  process.exit();
});


// routes
app.use("/uploads", express.static('public/uploads'));
app.use('/api/v1/admin', require('./app/routes/admin'));
app.use('*', (req, res) => {
  res.json({ status: 'error', msg: 'Not Route, call admin' });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.use(logger('dev'));


server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}.`);
});
