const express = require('express');
const app = express();
const multer = require('multer')
const FileModel = db.file;
const fs = require('fs')
const path = require('path')

// SET STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dirname = 'public'
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true })
    }
    cb(null, dirname)
  },
  filename: async function (req, file, cb) {
    let mime = file.mimetype.split('/')[1]
    mime = '.' + mime

    let filename = file.originalname
    filename = filename.replace(mime, '')
    filename = slugify(filename)

    let fileExist = await db['file'].findOne({ filename: filename + mime })
    if (fileExist || !filename) {
        filename = Date.now() + "-" + filename
    }

    filename += mime

    cb(null, filename)
  }
})
 
const upload = multer({ storage: storage })

app.post("/", upload.single('upload'), async(req, res) => {
  const file = req.file
  if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
  }

  await FileModel.create({
    filename: file.filename
  })

  res.json({
      fileName: file.filename,
      uploaded: 1,
      url: 'https://winelux.vn/upload/' + file.filename
  })
})

app.post("/collection", async (req, res) => {
  const rs = await getCollection('file', req.body)
  res.json(rs)
})

app.delete("/:id", async (req, res) => {
  try {
      let file = await FileModel.findOne({ _id: req.params.id })
      if (file) {
          try {
              let filePath = path.join(APP_DIR, 'public', file.filename)
              if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath)
              }

              await file.remove()
              return res.status(200).json({ status: 'success', message: 'Xóa thành công' });
          } catch (error) {
              return res.status(500).json({ status: 'error', message: error.message });
          }
      }
     
      
      res.status(400).json({ status: 'error', message: 'Không tìm thấy' });
  } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = app;
