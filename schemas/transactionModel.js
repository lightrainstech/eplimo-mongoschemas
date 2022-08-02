'use strict'

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    transactionType: {
      type: String,
      enum: ['activity', 'referral']
    },
    activityDate: {
      type: String
    },
    referral: {
      type: Schema.ObjectId,
      ref: 'asset'
    },
    status: { type: String, enum: ['added', 'completed'], default: 'added' },
    transactionId: { type: String, required: true },
    amount: { type: String, required: true }
  },
  { timestamps: true }
)

TransactionSchema.methods = {
  addTransaction: async function (
    user,
    transactionType,
    transactionId,
    transactionReference
  ) {
    const Transaction = mongoose.model('Transaction'),
      transactionModel = new Transaction()
    transactionModel.user = user
    transactionModel.transactionType = transactionType
    if (transactionType == 'activity') {
      transactionModel.activity = transactionReference
    }
    if (transactionType == 'referral') {
      transactionModel.referral = referral
    }
    transactionModel.transactionId = transactionId
    const result = await transactionModel.save()
    return result
  },
  updateTransaction: async function (transactionId) {
    const Transaction = mongoose.model('Transaction')
    const result = await Transaction.findOneAndUpdate(
      { transactionId },
      { status: 'completed' },
      { new: true }
    )
    return result
  }
}

TransactionSchema.statics = {
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

TransactionSchema.index({
  user: 1
})

module.exports = mongoose.model('Transaction', TransactionSchema)
