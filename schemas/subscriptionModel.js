'use strict'

// External Dependencies
const mongoose = require('mongoose')
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
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending'
    }
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
        select: 'name price durationInDays'
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
        select: 'name price durationInDays'
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
      { _id, subscriptionId },
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
        select: 'name price durationInDays'
      }
    }
    return Subscription.load(options)
  }
}

subscriptionSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select || 'user plan startDate endDate status createdAt updatedAt'
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
      options.select || 'user plan startDate endDate status createdAt updatedAt'
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
