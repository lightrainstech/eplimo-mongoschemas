'use strict'

// External Dependencies
const mongoose = require('mongoose')

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      default: 0
    },
    durationInDays: {
      type: Number,
      default: 0
    },
    image: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    theme: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

planSchema.methods = {
  getPlanById: async function (planId) {
    const Plan = mongoose.model('Plan')
    let query = { _id: planId }
    const options = {
      criteria: query
    }
    return Plan.load(options)
  },
  updatePlanById: async function (
    planId,
    name,
    description,
    price,
    durationInDays
  ) {
    const Plan = mongoose.model('Plan')
    return Plan.findOneAndUpdate(
      {
        _id: planId
      },
      {
        $set: {
          name,
          description,
          price,
          durationInDays
        }
      },
      { new: true }
    )
  },
  listPlans: async function () {
    const Plan = mongoose.model('Plan')
    const options = {
      criteria: {},
      page: 1,
      limit: 12
    }
    return Plan.list(options)
  }
}

planSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select ||
      'name description price durationInDays createdAt updatedAt'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },
  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page - 1
    const limit = parseInt(options.limit) || 12
    const select =
      options.select ||
      'name description price durationInDays createdAt updatedAt'
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

module.exports = mongoose.model('Plan', planSchema)
