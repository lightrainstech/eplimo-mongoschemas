'use strict'

// External Dependencies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const { addDays } = require('date-fns')

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    couponCode: {
      type: String,
      unique: true,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending'
    },
    totalHealthRewards: {
      type: Number,
      defauly: 0
    },
    rewardsDetails: [
      {
        vitals: {
          type: Number,
          default: 0
        },
        aiTraining: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

subscriptionSchema.methods = {
  getUserSubscription: async function (userId, status) {
    const Subscription = mongoose.model('Subscription')
    let query = { user: userId, status }
    const options = {
      criteria: query,
      populate: {
        path: 'plan',
        select:
          'name description price durationInDays offerPrice image theme extraFeature'
      }
    }
    return Subscription.load(options)
  },
  getUserSubscriptionDetails: async function (subscriptionId) {
    const Subscription = mongoose.model('Subscription')
    let query = { _id: subscriptionId }
    const options = {
      criteria: query,
      populate: {
        path: 'plan',
        select:
          'name description price durationInDays offerPrice image theme extraFeature'
      }
    }
    return Subscription.load(options)
  },
  updateSubscription: async function (
    userId,
    subscriptionId,
    status,
    duration
  ) {
    const Subscription = mongoose.model('Subscription')
    return Subscription.findOneAndUpdate(
      { _id: subscriptionId, user: userId },
      {
        $set: {
          status: status,
          startDate: new Date(),
          endDate: addDays(new Date(), duration)
        }
      }
    )
  },
  cancelSubscription: async function (subscriptionId, status) {
    const Subscription = mongoose.model('Subscription')
    return Subscription.findOneAndUpdate(
      { _id: ObjectId(subscriptionId), status: 'active' },
      {
        $set: {
          status: status
        }
      }
    )
  },
  getSubscriptionDataOfUser: async function (userId) {
    const Subscription = mongoose.model('Subscription')
    let query = { user: userId }
    const options = {
      criteria: query,
      populate: {
        path: 'plan',
        select:
          'user plan startDate endDate status totalHealthRewards rewardsDetails createdAt updatedAt'
      }
    }
    return Subscription.load(options)
  },
  getActiveSubscriptionDataOfUser: async function (userId) {
    const Subscription = mongoose.model('Subscription')
    let query = { user: userId, status: 'active' }
    const options = {
      criteria: query,
      populate: {
        path: 'plan',
        select:
          'user plan startDate endDate status totalHealthRewards rewardsDetails createdAt updatedAt'
      }
    }
    return Subscription.load(options)
  },
  updateRewards: async function (args) {
    try {
      let { recordId, totalRewards, vitals, aiTraining } = args
      const Subscription = mongoose.model('Subscription')
      return await Subscription.findOneAndUpdate(
        { _id: Object(recordId) },
        {
          $set: {
            totalHealthRewards: totalRewards,
            rewardsDetails: [
              {
                vitals: vitals,
                aiTraining: aiTraining
              }
            ]
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  getTotalRewards: async function (userId) {
    const Subscription = mongoose.model('Subscription')
    try {
      return await Subscription.aggregate([
        {
          $match: {
            user: userId
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$totalRewards'
            }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

subscriptionSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select ||
      'user plan startDate endDate status totalHealthRewards rewardsDetails createdAt updatedAt'
    return this.findOne(options.criteria)
      .populate(options.populate)
      .select(options.select)
      .exec(cb)
  },
  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page - 1
    const limit = parseInt(options.limit) || 12
    const select =
      options.select ||
      'user plan startDate endDate status totalHealthRewards rewardsDetails createdAt updatedAt'
    return this.find(criteria)
      .select(select)
      .populate(options.populate)
      .sort(options.sort || { createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec()
  }
}

module.exports = mongoose.model('Subscription', subscriptionSchema)
