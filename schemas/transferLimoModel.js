'use strict'

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const transferLimoSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    vault: { type: String, required: true },
    point: { type: String, required: true },
    transferType: { type: String, required: true },
    transferReference: { type: String, required: true }
  },
  { timestamps: true }
)

transferLimoSchema.methods = {
  addTransferLimoDetails: async function (
    userId,
    vault,
    point,
    transferType,
    transferReference
  ) {
    const TransferLimo = mongoose.model('TransferLimo'),
      transferLimoModel = new TransferLimo()
    try {
      transferLimoModel.user = userId
      transferLimoModel.vault = vault
      transferLimoModel.point = point
      transferLimoModel.transferType = transferType
      transferLimoModel.transferReference = transferReference
      const result = await transferLimoModel.save()
      return result
    } catch (err) {
      throw err
    }
  },
  getOneTransferDetail: async function () {
    const TransferLimo = mongoose.model('TransferLimo'),
      result = await TransferLimo.find({}).sort({ created_at: 1 }).limit(1)
    if (result.length > 0) return result[0]
    else return null
  },
  deleteTransferDetail: async function (transferId) {
    const TransferLimo = mongoose.model('TransferLimo'),
      result = await TransferLimo.findOneAndDelete({ _id: transferId })
    return result
  }
}

transferLimoSchema.statics = {
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

module.exports = mongoose.model('TransferLimo', transferLimoSchema)
;('use strict')

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const transferLimoSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    vault: { type: String, required: true },
    point: { type: String, required: true },
    transferType: { type: String, required: true },
    transferReference: { type: String, required: true }
  },
  { timestamps: true }
)

transferLimoSchema.methods = {
  addTransferLimoDetails: async function (
    userId,
    vault,
    point,
    transferType,
    transferReference
  ) {
    const TransferLimo = mongoose.model('TransferLimo'),
      transferLimoModel = new TransferLimo()
    try {
      transferLimoModel.user = userId
      transferLimoModel.vault = vault
      transferLimoModel.point = point
      transferLimoModel.transferType = transferType
      transferLimoModel.transferReference = transferReference
      const result = await transferLimoModel.save()
      return result
    } catch (err) {
      throw err
    }
  },
  getOneTransferDetail: async function () {
    const TransferLimo = mongoose.model('TransferLimo'),
      result = await TransferLimo.find({}).sort({ created_at: 1 }).limit(1)
    if (result.length > 0) return result[0]
    else return null
  },
  deleteTransferDetail: async function (transferId) {
    const TransferLimo = mongoose.model('TransferLimo'),
      result = await TransferLimo.findOneAndDelete({ _id: transferId })
    return result
  }
}

transferLimoSchema.statics = {
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

module.exports = mongoose.model('TransferLimo', transferLimoSchema)
