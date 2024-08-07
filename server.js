const express = require("express");
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const logger = require('morgan');

const http = require("http");
const server = http.createServer(app);
const URL_FRONTEND = process.env.VUE_APP_FRONTEND_URL


// global.serverDir = __dirname
const io = require('socket.io')(server, {
  cors: {
      origin: URL_FRONTEND,
      methods: ['GET', 'POST'],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");
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
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    // Đặt tên tệp cho tệp đã tải lên
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });


app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", URL_FRONTEND);
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.set("Access-Control-Allow-Credentials", "true"); 
  next();
});


app.use(cors({
  origin: URL_FRONTEND,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

const corsOptions = {
  origin: URL_FRONTEND, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

const methods = require('./app/helpers/methods')
global._APP_SECRET = process.env.SECRET || 'secret'
global.getCollection = methods.getCollection
global.globalConfig = {}
const db = require("./app/models");
global.db = db
global.APP_DIR = __dirname

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: URL_FRONTEND,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
    

mongoose.connect(process.env.MONGODB_CONNECT_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 
}).then(() => {
  console.log("Đã kết nối tới Mongodb.");
}).catch(err => {
  console.error("Connection error", err);
  process.exit();
});

// Connect Local

// mongoose.connect('mongodb://localhost:27017/NCKH', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000 // Tăng thời gian chờ lên 30 giây
// }).then(() => {
//   console.log("Đã kết nối tới Mongodb.");
// }).catch(err => {
//   console.error("Connection error", err);
//   process.exit();
// });

app.post("/public/upload", upload.array("file"), (req, res) => {
  const fileData = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`
  }));
  res.header("Access-Control-Allow-Origin", URL_FRONTEND);
  res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization');
  res.json({ success: true, message: "Tệp đã được tải lên thành công", files: fileData });
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