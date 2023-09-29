const express = require('express');
const app = express();
const $ = require('../../middlewares/safe-call')
const modelName = 'sprint'
const SprintModel = db[modelName];

app.post("/collection", $(async (req, res) => {
  req.body.populate = { path: 'user', select: 'fullname' }
  const rs = await getCollection(modelName, req.body)
  res.json(rs)
}))

app.get("/", $(async (req, res) => {
  let filter = {}
  if (req.user.role != 'admin') {
    filter.users= req.user._id
  }
  const docs = await SprintModel.find(filter).catch(error => {
    console.error('Error: ', error);
    return []
  })
  return res.json({ success: true, docs })
}))

app.get("/:id", $(async (req, res) => {
  const id = req.params.id
  if (id) {
    const doc = await SprintModel.findOne({ _id: id }).populate('tasks', 'name').catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (doc) {
      return res.json({ success: true, doc })
    }
  }

  return res.json({ success: false, doc: null })
}))

app.post("/", $(async (req, res) => {
  const data = req.body

  if (data) {
    if (data._id) {
      // update
      // TODO - validate
      const updatedDoc = await SprintModel.updateOne({ _id: data._id }, data).catch(error => {
        console.error('Error:', error);
        return null
      })

      if (updatedDoc) {
        return res.json({ success: true, doc: updatedDoc, status: 'success', message: 'Cập nhật thành công.' })
      } else {
        return res.json({ success: false, status: 'error', message: 'Cập nhật thất bại.' })
      }
    } else {
      // create new
      // TODO - validate
      data.user = req.user._id
      const createdDoc = await SprintModel.create(data).catch(error => {
        console.error('Error:', error);
        return null
      })

      if (createdDoc) {
        await db.task.updateMany({ _id: { $in: data.tasks } }, { $set: { sprint: createdDoc._id } })
        return res.json({ success: true, doc: createdDoc, status: 'success', message: 'Tạo mới thành công.' })
      } else {
        return res.json({ success: false, status: 'error', message: 'Tạo mới thất bại.' })
      }
    }
  }
  return res.json({ success: false, status: 'error', message: 'Vui lòng cung cấp dữ liệu.' })
}))

app.delete("/:id", $(async (req, res) => {
  const id = req.params.id
  if (id) {
    const result = await SprintModel.deleteOne({ _id: id }).catch(error => {
      console.error('Error: ', error);
      return null
    })

    if (result && result.deletedCount) {
      return res.json({ success: true, status: 'success', message: 'Xóa hoàn tất.' })
    }
  }

  return res.json({ success: false })
}))

module.exports = app;
