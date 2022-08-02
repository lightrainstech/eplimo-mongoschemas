'use strict'

// External Dependancies
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const ActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: ['walk', 'run', 'jog', 'started', 'abandoned'],
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
  stakedLimo: {
    type: Number,
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
  },
  transactionId: {
    type: String,
    default: ''
  },
  dateIndex: {
    type: String,
    default: moment(new Date()).format('DDMMYYYY')
  }
})

ActivitySchema.methods = {
  addActivity: async function (user, nft) {
    const Activity = mongoose.model('Activity'),
      activityModel = new Activity()
    activityModel.user = user
    activityModel.nft = nft
    const saveResult = await activityModel.save()
    const options = {
      criteria: { _id: ObjectId(saveResult._id) }
    }
    const result = await Activity.load(options)
      .populate({ path: 'nft' })
      .lean()
      .exec()
    result['canProceed'] = true
    result['remainingKm'] = result.nft.sneakerLife - 10
    return result
  },
  getActivityById: async function (activityId, userId) {
    const Activity = mongoose.model('Activity'),
      options = {
        criteria: { _id: ObjectId(activityId), user: ObjectId(userId) }
      },
      result = await Activity.load(options)
        .populate('nft')
        .populate('user')
        .lean()
        .exec()
    return result
  },
  updateActivity: async function (
    activityId,
    distance,
    speed,
    duration,
    activityType
  ) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.findOneAndUpdate(
        { _id: activityId },
        { distance, speed, duration, activityType },
        { new: true }
      )
        .populate('nft')
        .lean()
        .exec()
    result.nft.sneakerLife -= distance
    result['remainingKm'] = result.nft.sneakerLife - 10
    result['canProceed'] = true
    return result
  },
  endActivity: async function (activityId, point, activityType, stakedLimo) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.findOneAndUpdate(
        { _id: ObjectId(activityId) },
        {
          endTime: new Date(),
          point,
          activityType,
          stakedLimo
        },
        { new: true }
      )
        .populate('nft')
        .lean()
        .exec()
    result['remainingKm'] = result.nft.sneakerLife - 10
    result['canProceed'] = false
    return result
  },
  getActivityCountOfUser: async function (userId, nft) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            nft: ObjectId(nft),
            startTime: {
              $gte: new Date(moment().startOf('day').toISOString()),
              $lte: new Date(moment().endOf('day').toISOString())
            }
          }
        },
        {
          $count: 'activityCount'
        }
      ])
    if (result.length > 0) return result[0]
    else return { activityCount: 0 }
  },
  listSuccessActivityHistory: async function (userId, page) {
    const Activity = mongoose.model('Activity')
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page
    return await Activity.aggregate([
      {
        $match: {
          user: ObjectId(userId),
          activityType: { $in: ['walk', 'run', 'jog'] }
        }
      },
      {
        $sort: { startTime: -1 }
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft'
        }
      },
      {
        $project: {
          nft: { $first: '$nft' },
          activityType: 1,
          user: 1,
          distance: 1,
          speed: 1,
          stakedLimo: 1,
          duration: 1,
          startTime: 1,
          endTime: 1,
          point: 1,
          metaData: 1,
          dateIndex: 1
        }
      }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  listActivityHistory: async function (userId, page) {
    const Activity = mongoose.model('Activity')
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page
    return await Activity.aggregate([
      {
        $match: {
          user: ObjectId(userId)
        }
      },
      {
        $sort: { startTime: -1 }
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft'
        }
      },
      {
        $project: {
          nft: { $first: '$nft' },
          activityType: 1,
          user: 1,
          distance: 1,
          speed: 1,
          stakedLimo: 1,
          duration: 1,
          startTime: 1,
          endTime: 1,
          point: 1,
          metaData: 1,
          dateIndex: 1
        }
      }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  abandonActivity: async function (activityId) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.findOneAndUpdate(
        { _id: activityId, activityType: 'started' },
        { activityType: 'abandoned' },
        { new: true }
      )
    return result
  },
  getTotalKm: async function () {
    const Activity = mongoose.model('Activity'),
      previousDay = moment().subtract(1, 'day').toISOString(),
      result = await Activity.aggregate([
        {
          $match: {
            startTime: {
              $gte: new Date(moment(previousDay).startOf('day').toISOString())
            },
            endTime: {
              $lte: new Date(moment(previousDay).endOf('day').toISOString())
            }
          }
        },
        {
          $group: {
            _id: null,
            totalKm: { $sum: '$distance' }
          }
        },
        {
          $project: {
            totalKm: 1
          }
        }
      ])
    if (result.length > 0) return result[0]
    else return { _id: null, totalKm: 0 }
  },
  updateTransactionDetails: async function (activityId, transactionId) {
    const Activity = mongoose.model('Activity')
    const result = await Activity.findOneAndUpdate(
      { _id: activityId },
      { transactionId }
    )
    return result
  },
  getTotalPointsGainedByAllUsers: async function () {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $match: {
            startTime: {
              $gte: new Date(moment().startOf('day').toISOString())
            },
            endTime: {
              $lte: new Date(moment().endOf('day').toISOString())
            }
          }
        },
        {
          $group: {
            _id: null,
            usersList: { $addToSet: '$user' },
            totalPoint: { $sum: '$point' }
          }
        },
        {
          $project: {
            usersList: 1,
            totalPoint: 1
          }
        }
      ])
    if (result.length > 0) return result[0]
    else return { _id: null, totalPoint: 0, usersList: [] }
  },
  getTotalPointsGainedByAUser: async function (userId) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            startTime: {
              $gte: new Date(moment().startOf('day').toISOString())
            },
            endTime: {
              $lte: new Date(moment().endOf('day').toISOString())
            }
          }
        },
        {
          $group: {
            _id: null,
            totalPoint: { $sum: '$point' }
          }
        },
        {
          $project: {
            totalPoint: 1
          }
        }
      ])
    if (result.length > 0) return result[0]
    else return { _id: null, totalPoint: 0 }
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

ActivitySchema.index(
  {
    dateIndex: 'text'
  },
  { autoIndex: true }
)

ActivitySchema.index({
  activityType: 'text',
  partialFilterExpression: { $match: { activityType: 'started' } }
})

module.exports = mongoose.model('Activity', ActivitySchema)
