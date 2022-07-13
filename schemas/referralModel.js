'use strict'

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const ReferralSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true
    },
    referringUser: { type: Schema.ObjectId, ref: 'User', required: true },
    referredUser: { type: Schema.ObjectId, ref: 'User', required: true },
    referringUserPoints: { type: String, default: '0', required: true },
    referredUserPoints: { type: String, default: '0', required: true },
    projectName: {
      type: String,
      enum: ['healthfi', 'wealthfi', 'createfi', 'datafi'],
      default: 'healthfi',
      required: true
    }
  },
  { timestamps: true }
)

ReferralSchema.methods = {
  addReferral: async function (
    referralCode,
    referringUser,
    referringUserPoints,
    referredUser,
    referredUserPoints,
    projectName
  ) {
    const Referral = mongoose.model('Referral'),
      referralModel = new Referral()
    try {
      referralModel.referralCode = referralCode
      referralModel.referredUser = referredUser
      referralModel.referredUserPoints = referredUserPoints
      referralModel.referringUser = referringUser
      referralModel.referringUserPoints = referringUserPoints
      referralModel.projectName = projectName
      const result = await referralModel.save()
      return result
    } catch (err) {
      throw err
    }
  },
  getReferringUsers: async function (userId) {
    const Referral = mongoose.model('Referral'),
      options = {
        criteria: { referredUser: userId },
        populate: {
          path: 'referringUser',
          select:
            'lpoType lpoCategory lpoSpecialization isPractitioner practitionerCategory userName name email'
        }
      }
    return await Referral.list(options).lean().exec()
  },
  getReferredByOfAUser: async function (userId) {
    const Referral = mongoose.model('Referral'),
      options = {
        criteria: { referringUser: userId },
        populate: {
          path: 'referringUser',
          select:
            'lpoType lpoCategory lpoSpecialization isPractitioner practitionerCategory userName name email'
        }
      }
    return await Referral.list(options).lean().exec()
  },
  checkReferralValidation: async function (
    referringUserId,
    referredUserId,
    projectName
  ) {
    const Referral = mongoose.model('Referral'),
      result = await Referral.findOne({
        $or: [
          {
            referringUser: referringUserId,
            projectName
          }
        ]
      })
    return result
  }
}

ReferralSchema.statics = {
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

ReferralSchema.index(
  {
    user: 1
  },
  {
    referringUser: 1
  },
  {
    referredUser: 1
  }
)

ReferralSchema.index({ projectName: 1, referringUser: 1 }, { unique: true })

module.exports = mongoose.model('Referral', ReferralSchema)
