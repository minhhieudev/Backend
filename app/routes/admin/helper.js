const express = require('express');
const app = express();

app.get("/init", (req, res) => {
  return res.json({
    success: true,
    //taskStatus: db.task.STATUS_LABEL
  })
});

module.exports = app;