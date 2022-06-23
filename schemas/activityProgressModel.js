'use strict'

const activityProgressPopulateQueries = {}

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const ActivityProgressSchema = new mongoose.Schema({
  activity: { type: Schema.ObjectId, ref: 'Activity', required: true },
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  distance: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['inProgress', 'end'],
    required: true
  }
})

ActivityProgressSchema.methods = {
  addActivityProgress: async function (
    userId,
    activityId,
    distance,
    speed,
    duration,
    status
  ) {
    const ActivityProgress = mongoose.model('ActivityProgress'),
      activityProgressModel = new ActivityProgress()
    activityProgressModel.activity = activityId
    activityProgressModel.user = userId
    activityProgressModel.distance = distance
    activityProgressModel.speed = speed
    activityProgressModel.duration = duration
    activityProgressModel.status = status
    const result = await activityProgressModel.save()
    return result
  },
  listActivityDetails: async function (activityId, userId) {
    const ActivityProgress = mongoose.model('ActivityProgress'),
      result = await ActivityProgress.aggregate([
        { $match: { activity: ObjectId(activityId), user: ObjectId(userId) } },
        {
          $group: {
            _id: '$activity',
            totalDistance: { $sum: '$distance' },
            totalSpeed: { $avg: '$speed' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ])
    if (result.length == 0) {
      return null
    }
    return result[0]
  }
}

ActivityProgressSchema.statics = {
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

ActivityProgressSchema.index({
  activity: 1
})

module.exports = mongoose.model('ActivityProgress', ActivityProgressSchema)
