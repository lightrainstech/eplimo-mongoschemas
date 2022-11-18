'use strict'

// External Dependancies
const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const ActivitySchema = new mongoose.Schema(
  {
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
    startTime: { type: Date, required: true, get: formatDate },
    endTime: {
      type: Date,
      get: formatDate
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
      type: String
    }
  },
  { toJSON: { getters: true } },
  { toObject: { getters: true } }
)

function formatDate(startTime) {
  return moment(startTime).format('D MMM YY, h:mm a')
}

ActivitySchema.methods = {
  addActivity: async function (user, nft) {
    const Activity = mongoose.model('Activity'),
      activityModel = new Activity()
    activityModel.user = user
    activityModel.nft = nft
    activityModel.startTime = new Date()
    activityModel.dateIndex = moment(new Date()).format('DDMMYYYY')
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
  sumAllKms: async function () {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      { $match: {} },
      { $group: { _id: null, sum: { $sum: '$distance' } } }
    ])
  },
  getActivityCountOfUser: async function (userId, nft, dateIndex) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            nft: ObjectId(nft),
            activityType: { $in: ['walk', 'run', 'jog'] },
            dateIndex
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
    return Activity.find({
      user: ObjectId(userId),
      activityType: { $in: ['walk', 'run', 'jog'] },
      endTime: {
        $exists: true
      }
    })
      .limit(limit)
      .skip(limit * page)
      .populate({ path: 'nft' })
      .sort({ startTime: -1 })
      .then(a => a.map(p => p.toJSON()))
  },
  listActivityHistory: async function (userId, page) {
    const Activity = mongoose.model('Activity')
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    return Activity.find({ user: ObjectId(userId) })
      .limit(limit)
      .skip(limit * page)
      .populate({ path: 'nft' })
      .sort({ startTime: -1 })
      .then(a => a.map(p => p.toJSON()))
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
  getTotalKm: async function (dateIndex) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $lookup: {
            from: 'assets',
            let: { nftId: '$nft' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$nftId'] },
                      { $ne: ['$category', 'Trial'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  category: 1
                }
              }
            ],
            as: 'nft'
          }
        },
        {
          $match: {
            activityType: { $in: ['walk', 'run', 'jog'] },
            'nft.0': {
              $exists: true
            },
            dateIndex
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
  getTotalPointsGainedByAllUsers: async function (date) {
    const Activity = mongoose.model('Activity'),
      previousDay = moment().subtract(1, 'day').toISOString(),
      result = await Activity.aggregate([
        {
          $match: {
            activityType: { $in: ['walk', 'run', 'jog'] },
            dateIndex: date
          }
        },
        {
          $lookup: {
            from: 'assets',
            let: { nftId: '$nft' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$nftId'] },
                      { $eq: ['$category', 'Trial'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  category: 1
                }
              }
            ],
            as: 'trialNFT'
          }
        },
        {
          $lookup: {
            from: 'assets',
            let: { nftId: '$nft' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$nftId'] },
                      { $ne: ['$category', 'Trial'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  category: 1
                }
              }
            ],
            as: 'notTrialNFT'
          }
        },
        {
          $group: {
            _id: null,
            trialUsersList: {
              $addToSet: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: [{ $size: '$trialNFT' }, 0] },
                      { $eq: [{ $size: '$notTrialNFT' }, 0] }
                    ]
                  },
                  then: '$user',
                  else: '$$REMOVE'
                }
              }
            },
            nonTrialUsersList: {
              $addToSet: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: [{ $size: '$notTrialNFT' }, 0] },
                      { $eq: [{ $size: '$trialNFT' }, 0] }
                    ]
                  },
                  then: '$user',
                  else: '$$REMOVE'
                }
              }
            },
            totalPoint: { $sum: '$point' }
          }
        },
        {
          $project: {
            _id: 1,
            trialUsersList: 1,
            nonTrialUsersList: 1,
            totalPoint: 1
          }
        }
      ])
    if (result.length > 0) return result[0]
    else
      return {
        _id: null,
        totalPoint: 0,
        trialUsersList: [],
        nonTrialUsersList: []
      }
  },
  getTotalPointsGainedByAUser: async function (userId, date) {
    const Activity = mongoose.model('Activity'),
      previousDay = moment().subtract(1, 'day').toISOString(),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            activityType: { $in: ['walk', 'run', 'jog'] },
            dateIndex: date
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
  },
  getActiveParticipants: async function (date) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          dateIndex: date
        }
      },
      {
        $group: {
          _id: null,
          uniqueValues: { $addToSet: '$user' }
        }
      }
    ])
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
  },
  {
    dateIndex: 1
  }
)

// ActivitySchema.index(
//   {
//     dateIndex: 'text'
//   },
//   { autoIndex: true }
// )

ActivitySchema.index({
  activityType: 'text',
  partialFilterExpression: { $match: { activityType: 'started' } }
})

module.exports = mongoose.model('Activity', ActivitySchema)
