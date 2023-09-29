
const express = require('express');
const router = express.Router();
const $ = require('../../middlewares/safe-call')

router.post('/collection', $(async function (req, res) {
  let settings = await db.setting.find()
  res.json({ settings })
}))


router.put('/', $(async function (req, res) {
  const settings = req.body

  for await (let key of Object.keys(settings)) {
    await db.setting.findOneAndUpdate({ key }, { data: settings[key] }, {upsert: true});
  }

  let _settings = await db.setting.find()
  _settings.forEach(setting => {
      globalConfig[setting.key] = setting.data
  });

  res.status(200).json({ status: 'success', message: 'Cập nhật thành công' });
}))

module.exports = express.Router().use(router)