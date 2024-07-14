const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.post("/signin", async (req, res) => {
  db.user.findOne({
    email: req.body.email
  })
    .exec((err, admin) => {
      if (err) {
        res.status(500).json({ status: 'error', message: err });
        return;
      }
      if (!admin) {
        return res.status(401).json({ status: 'error', message: "Không tìm thấy tài khoản." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        admin.password
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          status: 'error',
          message: "Tài khoản hoặc mật khẩu không đúng"
        });
      }

      const token = jwt.sign({ id: admin._id }, _APP_SECRET, {
        expiresIn: 86400 // 24 hours
      });
      res.status(200).json({
        success: true,
        status: 'success',
        message: 'Đăng nhập thành công',
        user: {
          _id: admin._id,
          fullname: admin.fullname,
          avatarUrl: admin.avatarUrl,
          email: admin.email,
          accessToken: token,
          role: admin.role,
        }
      });
    });
});

module.exports = app;