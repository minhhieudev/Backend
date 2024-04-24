const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const logger = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

mongoose.set('strictQuery', false);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:8081', // Thay đổi địa chỉ của ứng dụng Vue.js của bạn
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('newNotification', () => {
    io.emit('updateNotifications');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/public/upload', upload.array('file'), (req, res) => {
  const fileData = req.files.map((file) => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`,
  }));

  // Đặt tiêu đề CORS cho phản hồi
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  res.json({ success: true, message: 'Tệp đã được tải lên thành công', files: fileData });
});

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));

// MongoDB connection
const mongoURI = process.env.MONGODB_CONNECT_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log('Đã kết nối tới MongoDB.');
  })
  .catch((err) => {
    console.error('Lỗi kết nối', err);
    process.exit(1);
  });

// Static files and routes
app.use('/uploads', express.static('public/uploads'));
app.use('/api/v1/admin', require('./app/routes/admin'));

app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', msg: 'Không tìm thấy trang yêu cầu' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
});

// Initialize settings and admin user
async function initialize() {
  const settings = await db.setting.find();
  settings.forEach((setting) => {
    globalConfig[setting.key] = setting.data;
  });

  const adminDefaultUser = await db.user.findOne({ email: 'admin@gmail.com' });
  if (!adminDefaultUser) {
    const hashedPassword = bcrypt.hashSync('123123qq@', 8);
    db.user.create({
      fullname: 'Admin',
      role: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
    });
  }
}

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
  console.log(`Server đang chạy trên cổng ${PORT}.`);
  await initialize();
});
