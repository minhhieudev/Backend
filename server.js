const express = require("express");
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const logger = require('morgan');

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://minhhieudev.github.io', // URL gốc mà bạn cho phép
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
    }
});

// Thiết lập kết nối với MongoDB
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Tăng thời gian chờ kết nối lên 30 giây
}).then(() => {
    console.log("Đã kết nối tới MongoDB.");
}).catch(err => {
    console.error("Lỗi kết nối", err);
    process.exit();
});

// Cài đặt multer để xử lý tải lên tệp
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads"); // Thư mục để lưu trữ tệp đã tải lên
    },
    filename: (req, file, cb) => {
        // Đặt tên cho tệp đã tải lên
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Xử lý tải lên tệp
app.post("/public/upload", upload.array("file"), (req, res) => {
    const fileData = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}` 
    }));
    res.json({ success: true, message: "Tệp đã được tải lên thành công", files: fileData });
});

// Thiết lập các middleware
app.use(cors({ origin: 'https://minhhieudev.github.io' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

// Thiết lập tiêu đề CORS
app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "https://minhhieudev.github.io");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Định tuyến API
app.use('/api/v1/admin', require('./app/routes/admin'));

// Đường dẫn tĩnh
app.use("/uploads", express.static('public/uploads'));

// Đường dẫn mặc định nếu không tìm thấy
app.use('*', (req, res) => {
    res.json({ status: 'error', msg: 'Not Route, call admin' });
});

// Xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Sự kiện kết nối Socket.IO
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

// Lắng nghe cổng
const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
    console.log(`Server đang chạy trên cổng ${PORT}.`);
});
