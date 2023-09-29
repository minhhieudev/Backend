module.exports = {
  slugify: function (str) {
    str = str.replace(/^\s+|\s+$/g, "");
    str = str.toLowerCase();
    str = str
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  
    return str;
  },
  getCollection: async function (ModelName, bodyData) {
    let Model = db[ModelName]

    let filter = {}
    let sort = bodyData.sort || { createdAt: -1 }
    if (bodyData.filter) {
      filter = bodyData.filter
      if (ModelName == 'product' && filter.catalogs) {
        let catalogFilter = filter.catalogs['$in']
        if (catalogFilter.length) {
          let catalogs = await db.catalog.find({ parent: { $in: catalogFilter } })
          catalogs.forEach(catalog => {
            filter.catalogs['$in'].push(catalog._id)
          })
        }
      }
    }

    let limit = 25
    let page = 1
    
    if ('pagination' in bodyData) {
        const pagination = bodyData['pagination'];
        if ('page_size' in pagination) {
            limit = pagination['page_size'];
        }
        if ('current_page' in pagination) {
            page = pagination['current_page'];
        }
    }

    function getTotalCount() {
      return new Promise((resolve, reject) => {
        Model.find(filter)
          .countDocuments()
          .exec()
          .then((count) => {
            resolve(count)
          })
          .catch((err) => reject(err))
      })
    }

    function getList() {
      return new Promise((resolve, reject) => {
        const qr = Model.find(filter)
          .skip((page - 1) * limit)
          .sort(sort)
          .limit(limit)

        if (bodyData.populate) {
          qr.populate(bodyData.populate)
        }

        qr.exec()
          .then((docs) => {
            resolve(docs)
          })
          .catch((err) => {
            console.log(err);
            reject(err)
          })
      })
    }

    return Promise.all([getTotalCount(), getList()]).then(([count, list]) => {
      return {
        success: true,
        total: count,
        docs: list,
      }
    }).catch((err) => {
      return {
        success: false, 
        message: err
      }
    })
  }
}