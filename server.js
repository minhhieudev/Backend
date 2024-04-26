const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const logger = require('morgan');
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");

const dotenv = require('dotenv');
const methods = require('./app/helpers/methods');
const db = require("./app/models");
const adminRoutes = require('./app/routes/admin');

dotenv.config();  // Load environment variables from a .env file

// Create an Express application and HTTP server
const app = express();
const server = http.createServer(app);

// Create a Socket.IO server with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://minhhieudev.github.io',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("Client connected");

  // Listen for "newNotification" event
  socket.on("newNotification", () => {
    io.emit("updateNotifications");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// File upload endpoint
app.post("/public/upload", upload.array("file"), (req, res) => {
  const fileData = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`
  }));

  res.json({ success: true, message: "Files uploaded successfully", files: fileData });
});

// Apply CORS settings using middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://minhhieudev.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to handle body parsing
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use(logger('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define static file serving route
app.use("/uploads", express.static('public/uploads'));

// Use admin routes
app.use('/api/v1/admin', adminRoutes);

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Define the port and start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialization function to set up global configurations
async function init() {
  const settings = await db.setting.find();
  global.globalConfig = {};

  settings.forEach(setting => {
    global.globalConfig[setting.key] = setting.data;
  });

  const adminUser = await db.user.findOne({ email: 'admin@gmail.com' });
  if (!adminUser) {
    const hashedPassword = bcrypt.hashSync('123123qq@', 8);
    await db.user.create({
      fullname: 'Admin',
      role: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
    });
  }
}

// Run the initialization function
init();
