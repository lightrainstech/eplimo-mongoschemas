'use strict'

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const WhiteListSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    wallet: { type: String, required: true },
    numberOfNFT: { type: Number, required: true }
  },
  { timestamps: true }
)

WhiteListSchema.methods = {
  addWhiteList: async function (email, wallet, numberOfNFT) {
    const WhiteList = mongoose.model('WhiteList'),
      whiteListModel = new WhiteList()
    try {
      whiteListModel.email = email
      whiteListModel.wallet = wallet
      whiteListModel.numberOfNFT = numberOfNFT
      const result = await whiteListModel.save()
      return result
    } catch (err) {
      throw err
    }
  }
}

WhiteListSchema.statics = {
  load: function (options) {
    options.select = options.select || ''
    return this.findOne(options.criteria).select(options.select)
  },

  list: function (options) {
    const criteria = options.criteria || {}
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria).select(select).sort(sortRule).populate(populate)
  },

  listForPagination: function (options) {
    const criteria = options.criteria || {}
    const page = options.page === 0 ? 0 : options.page - 1
    const limit = parseInt(options.limit) || 18
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria)
      .select(select)
      .sort(sortRule)
      .limit(limit)
      .skip(limit * page)
      .populate(populate)
      .lean()
      .exec()
  }
}

WhiteListSchema.index({
  email: 1
})

module.exports = mongoose.model('WhiteList', WhiteListSchema)
