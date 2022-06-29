'use strict'

const activityPopulateQueries = {}

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const ActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: ['walk', 'run', 'jog', 'started'],
    default: 'started',
    required: true
  },
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  nft: { type: Schema.ObjectId, ref: 'Asset', required: true },
  distance: {
    type: Number,
    required: true,
    default: 0
  },
  speed: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  startTime: { type: Date, required: true, default: new Date() },
  endTime: {
    type: Date
  },
  point: {
    type: Number,
    default: 0
  },
  metaData: {
    type: Object,
    default: {}
  }
})

ActivitySchema.methods = {
  addActivity: async function (user, nft) {
    const Activity = mongoose.model('Activity'),
      activityModel = new Activity()
    activityModel.user = user
    activityModel.nft = nft
    const result = await activityModel.save()
    return result
  },
  getActivityById: async function (activityId, userId) {
    const Activity = mongoose.model('Activity'),
      options = {
        criteria: { _id: ObjectId(activityId), user: ObjectId(userId) }
      },
      result = await Activity.load(options).populate('nft').lean().exec()
    return result
  },
  addActivityTotal: async function (
    resultActivityId,
    speed,
    distance,
    duration,
    point,
    activityType
  ) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.findOneAndUpdate(
        { _id: ObjectId(resultActivityId) },
        { distance, speed, duration, endTime: new Date(), point, activityType },
        { new: true }
      )
    return result
  }
}

ActivitySchema.statics = {
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

ActivitySchema.index(
  {
    user: 1
  },
  {
    nft: 1
  }
)

module.exports = mongoose.model('Activity', ActivitySchema)
