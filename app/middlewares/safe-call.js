
module.exports = function (fn) {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next)
    } catch (error) {
      console.error(`API Error`, error)
      res.json({ status: 'error', message: 'There was an error from server, please try again later.', error })
    }
  }
}
