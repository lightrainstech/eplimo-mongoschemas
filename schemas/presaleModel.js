'use strict'
// External Dependancies
const mongoose = require('mongoose')
const { Mixed } = mongoose.Schema.Types
const bcrypt = require('bcrypt')

const PreSaleSchema = new mongoose.Schema(
  {
    delegation: {
      type: String,
      required: true,
      enum: ['MR', 'MS', 'Organization', 'NA'],
      default: 'NA'
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    walletAddress: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    investmentType: {
      type: String,
      required: true,
      enum: ['staking', 'vesting']
    },
    linkedin: {
      type: String
    },
    sourceOfInfo: {
      type: String
    },
    comments: {
      type: String
    },
    saleStatus: {
      type: Boolean,
      default: false
    },
    referralCode: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

PreSaleSchema.methods = {
  getPresaleRequests: async function () {
    const Presale = mongoose.model('PreSale')
    return await Presale.find({}).sort({ createdAt: 1 })
  },
  getByEmail: async function (email) {
    const Presale = mongoose.model('PreSale')
    return await Presale.findOne({ email: email })
  }
}

PreSaleSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'firstName lastName email'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },

  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page - 1
    const limit = parseInt(options.limit) || 12
    const select = options.select || 'firstName lastName email -__v'
    return this.find(criteria)
      .select(select)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec()
  }
}

module.exports = mongoose.model('PreSale', PreSaleSchema)
