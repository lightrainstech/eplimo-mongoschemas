'use strict'

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const DeleteLogSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

DeleteLogSchema.methods = {
  addDeleteLog: async function (userId) {
    const DeleteLog = mongoose.model('DeleteLog'),
      deleteLogModel = new DeleteLog()
    try {
      deleteLogModel.user = userId
      const result = await deleteLogModel.save()
      return result
    } catch (err) {
      throw err
    }
  }
}

DeleteLogSchema.statics = {
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

DeleteLogSchema.index({
  user: 1
})

module.exports = mongoose.model('DeleteLog', DeleteLogSchema)
