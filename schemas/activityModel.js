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
      enum: ['walk', 'run', 'jog', 'started', 'abandoned', 'workout'],
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
    earnedPoint: {
      type: Number,
      default: 0
    },
    dateIndex: {
      type: String
    },
    corpId: {
      type: String
    },
    isWearable: {
      type: Boolean,
      default: false
    },
    burnedCalories: {
      type: Number,
      default: 0
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
    result['remainingKm'] = result.nft.sneakerLife
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
    result['remainingKm'] = result.nft.sneakerLife
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
    result['remainingKm'] = result.nft.sneakerLife
    result['canProceed'] = false
    return result
  },
  _endActivity_new: async function (args) {
    let { activityId, point, activityType, stakedLimo, earnedPoint } = args
    const Activity = mongoose.model('Activity'),
      result = await Activity.findOneAndUpdate(
        { _id: ObjectId(activityId) },
        {
          endTime: new Date(),
          point,
          activityType,
          stakedLimo,
          earnedPoint
        },
        { new: true }
      )
        .populate('nft')
        .lean()
        .exec()
    result['remainingKm'] = result.nft.sneakerLife
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
    const Activity = mongoose.model('Activity')
    return await Activity.find({
      user: ObjectId(userId),
      nft: ObjectId(nft),
      activityType: { $in: ['walk', 'run', 'jog'] },
      dateIndex,
      endTime: { $exists: true }
    }).countDocuments()
  },

  getActivityCountOfSneaker: async function (nft, userId, dateIndex) {
    const Activity = mongoose.model('Activity')
    if (nft.toString() === '62f8c9b0e6a37fdd66bdec60') {
      return await Activity.find({
        nft: ObjectId(nft),
        user: ObjectId(userId),
        activityType: { $in: ['walk', 'run', 'jog'] },
        dateIndex,
        endTime: { $exists: true }
      }).countDocuments()
    } else {
      return await Activity.find({
        nft: ObjectId(nft),
        activityType: { $in: ['walk', 'run', 'jog'] },
        dateIndex,
        endTime: { $exists: true }
      }).countDocuments()
    }
  },

  listSuccessActivityHistory: async function (userId, page, isWearable) {
    const Activity = mongoose.model('Activity')
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    let criteria = {
      user: ObjectId(userId),
      activityType: { $in: ['walk', 'run', 'jog', 'workout'] },
      endTime: {
        $exists: true
      }
    }
    if (isWearable) {
      criteria.$and = [{ isWearable: true }, { isWearable: { $exists: true } }]
    } else {
      criteria.$or = [
        { isWearable: { $ne: true } },
        { isWearable: { $exists: false } }
      ]
    }
    return await Activity.aggregate([
      {
        $match: criteria
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
          dateIndex: 1,
          burnedCalories: 1,
          isWearable: 1
        }
      }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  listActivityHistory: async function (userId, page, isWearable) {
    const Activity = mongoose.model('Activity')
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    let criteria = {}
    criteria.user = ObjectId(userId)
    if (isWearable) {
      criteria.$and = [{ isWearable: true }, { isWearable: { $exists: true } }]
    } else {
      criteria.$or = [
        { isWearable: { $ne: true } },
        { isWearable: { $exists: false } }
      ]
    }
    return await Activity.aggregate([
      {
        $match: criteria
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
          dateIndex: 1,
          isWearable: 1
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
            activityType: { $in: ['walk', 'run', 'jog', 'workout'] },
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
                  then: { user: '$user', isWearable: '$isWearable' },
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
                  then: { user: '$user' },
                  else: '$$REMOVE'
                }
              }
            },
            nonTrialNFT: {
              $addToSet: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: [{ $size: '$notTrialNFT' }, 0] },
                      { $eq: [{ $size: '$trialNFT' }, 0] }
                    ]
                  },
                  then: { nft: '$nft', user: '$user' },
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
            totalPoint: 1,
            nonTrialNFT: 1
          }
        }
      ])
    if (result.length > 0) return result[0]
    else
      return {
        _id: null,
        totalPoint: 0,
        trialUsersList: [],
        nonTrialUsersList: [],
        nonTrialNFT: []
      }
  },
  getTotalPointsGainedByAUser: async function (userId, date) {
    const Activity = mongoose.model('Activity'),
      previousDay = moment().subtract(1, 'day').toISOString(),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            activityType: { $in: ['walk', 'run', 'jog', 'workout'] },
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
  getTotalTrialWearablePointsOfAUser: async function (userId, date) {
    const Activity = mongoose.model('Activity'),
      previousDay = moment().subtract(1, 'day').toISOString(),
      result = await Activity.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            activityType: { $in: ['workout'] },
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
  },
  getAssetAllData: async function () {
    const Activity = mongoose.model('Activity')
    let data = await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          point: { $ne: 0 }
        }
      },
      {
        $group: {
          _id: '$nft',
          totalPoints: { $sum: '$point' }
        }
      },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          'details.tokenId': 1,
          'details.category': 1,
          'details._id': 1,
          'details.efficiencyIndex': 1,
          'details.sneakerLife': 1,
          'details.price': 1
        }
      }
    ])
    return data
  },
  getActivityByDate: async function (nftId, dateArray) {
    try {
      const Activity = mongoose.model('Activity')
      let data = await Activity.aggregate([
        {
          $match: {
            nft: ObjectId(nftId),
            dateIndex: { $in: dateArray },
            endTime: {
              $exists: true
            }
          }
        },
        {
          $group: {
            _id: '$dateIndex',
            totalPoints: { $sum: '$point' },
            user: { $first: '$user' },
            nft: { $first: '$nft' }
          }
        }
      ])
      return data
    } catch (e) {
      throw e
    }
  },
  getTotalKiloMeters: async function (date) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          endTime: {
            $exists: true
          },
          dateIndex: date
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
  },
  corp_addActivity: async function (user, nft, corpId) {
    const Activity = mongoose.model('Activity'),
      activityModel = new Activity()
    activityModel.user = user
    activityModel.nft = nft
    activityModel.startTime = new Date()
    activityModel.dateIndex = moment(new Date()).format('DDMMYYYY')
    activityModel.corpId = corpId
    const saveResult = await activityModel.save()
    const options = {
      criteria: { _id: ObjectId(saveResult._id) }
    }
    const result = await Activity.load(options)
      .populate({ path: 'nft' })
      .lean()
      .exec()
    result['canProceed'] = true
    result['remainingKm'] = result.nft.sneakerLife
    return result
  },
  isSneakerInUse: async function (userId, nftId, dateIndex) {
    const Activity = mongoose.model('Activity'),
      data = await Activity.findOne({
        user: ObjectId(userId),
        nft: ObjectId(nftId),
        activityType: { $in: ['walk', 'run', 'jog', 'started'] },
        dateIndex,
        endTime: { $exists: false }
      })
    if (data) {
      return true
    } else {
      return false
    }
  },
  getTotalPointsGainedBySneaker: async function (nftId, date) {
    const Activity = mongoose.model('Activity'),
      result = await Activity.aggregate([
        {
          $match: {
            nft: ObjectId(nftId),
            activityType: { $in: ['walk', 'run', 'jog', 'workout'] },
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
  sneakerPointsInInterval: async function (startDate, endDate, nftId) {
    try {
      const Activity = mongoose.model('Activity')
      let criteria = {
        nft: ObjectId(nftId),
        activityType: { $in: ['walk', 'run', 'jog', 'workout'] }
      }
      if (startDate !== null && endDate !== null) {
        criteria.$and = [
          { endTime: { $gte: startDate } },
          { endTime: { $lte: endDate } }
        ]
      }

      if (startDate !== null && endDate === null) {
        criteria.$and = [{ endTime: { $gte: startDate } }]
      }

      if (startDate === null && endDate !== null) {
        criteria.$and = [{ endTime: { $lte: endDate } }]
      }
      return Activity.aggregate([
        {
          $match: criteria
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
    } catch (error) {
      throw error
    }
  },
  getTotalCalBySneaker: async function (nftId, userId, date) {
    try {
      const Activity = mongoose.model('Activity')
      let criteria = {
        nft: ObjectId(nftId)
      }
      if (nftId.toString() === '6426a2b6a26f62f9ae79d951') {
        criteria.user = ObjectId(userId)
        criteria.dateIndex = date
      } else {
        if (date !== null) {
          criteria.startTime = {
            $gt: date
          }
        }
      }

      return await Activity.aggregate([
        {
          $match: criteria
        },
        {
          $group: {
            _id: 'nft',
            totalCal: { $sum: '$burnedCalories' }
          }
        },
        {
          $project: {
            totalCal: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  addActivityFromWearable: async function (args) {
    try {
      const Activity = mongoose.model('Activity'),
        activityModel = new Activity(),
        { user, nft, cal, startTime, dateIndex, endTime, isWearable, point } =
          args
      activityModel.user = user
      activityModel.nft = nft
      activityModel.startTime = new Date()
      activityModel.dateIndex = moment(new Date()).format('DDMMYYYY')
      activityModel.isWearable = isWearable
      activityModel.point = point
      activityModel.burnedCalories = cal
      activityModel.endTime = endTime
      activityModel.activityType = 'workout'
      return await activityModel.save()
    } catch (error) {
      throw error
    }
  },
  corp_getTotalKiloMeters: async function (corpId) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: { corpId: corpId, point: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$user',
          totalDistance: { $sum: '$distance' },
          totalPoints: { $sum: '$point' }
        }
      },
      {
        $sort: {
          totalPoints: -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $project: {
          _id: 0,
          user: '$_id',
          totalDistance: 1,
          totalPoints: 1,
          name: { $arrayElemAt: ['$userData.name', 0] },
          email: { $arrayElemAt: ['$userData.email', 0] }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$totalDistance' },
          users: {
            $push: {
              user: '$user',
              name: '$name',
              email: '$email',
              totalDistance: '$totalDistance',
              totalPoints: '$totalPoints'
            }
          }
        }
      }
    ])
  },
  corp_getActiveParticipants: async function (date, corpId) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          dateIndex: date,
          corpId: corpId
        }
      },
      {
        $group: {
          _id: null,
          uniqueValues: { $addToSet: '$user' }
        }
      }
    ])
  },
  corp_getSenakerStat: async function (corpId, startDate) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          corpId: corpId,
          endTime: {
            $exists: true
          },
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          unique_values: { $addToSet: '$nft' }
        }
      },
      {
        $project: {
          _id: 1,
          unique_count: { $size: '$unique_values' }
        }
      }
    ])
  },
  corp_getPointsStat: async function (corpId, startDate) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          corpId: corpId,
          endTime: {
            $exists: true
          },

          startTime: { $gte: startDate }
        }
      },
      {
        $project: {
          dateIndex: 1,
          point: 1,
          _id: 1,
          startTime: 1
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $group: {
          _id: '$dateIndex',
          points: { $sum: '$point' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          totalPoints: {
            $sum: '$points'
          },
          data: {
            $push: {
              _id: '$_id',
              point: '$points'
            }
          }
        }
      }
    ])
  },
  corp_getActiveSneakers: async function (corpId) {
    const Activity = mongoose.model('Activity')
    return await Activity.aggregate([
      {
        $match: {
          activityType: { $in: ['walk', 'run', 'jog'] },
          corpId: corpId
        }
      },
      {
        $group: {
          _id: null,
          uniqueValues: { $addToSet: '$nft' }
        }
      }
    ])
  },
  getActivityStatus: async function (args) {
    try {
      const { userId, page } = args
      const Activity = mongoose.model('Activity')
      return await Activity.aggregate([
        {
          $match: {
            activityType: 'workout',
            user: ObjectId(userId),
            endTime: {
              $exists: true
            }
          }
        },
        {
          $project: {
            dateIndex: 1,
            burnedCalories: 1,
            startTime: 1
          }
        },
        {
          $sort: {
            startTime: -1
          }
        },
        {
          $group: {
            _id: '$dateIndex',
            burnedCalories: { $sum: '$burnedCalories' }
          }
        }
      ])
    } catch (error) {
      throw error
    }
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
    _id: 1,
    user: 1
  },
  {
    user: 1,
    nft: 1,
    activityType: 1,
    dateIndex: 1,
    endTime: 1
  },
  {
    user: 1,
    activityType: 1,
    endTime: 1
  },
  {
    user: 1,
    activityType: 1,
    endTime: 1,
    isWearable: 1
  },
  {
    user: 1,
    isWearable: 1
  },
  {
    _id: 1,
    activityType: 1
  },
  {
    activityType: 1,
    dateIndex: 1
  },
  {
    user: 1,
    activityType: 1,
    dateIndex: 1
  },
  {
    activityType: 1,
    point: 1
  },
  {
    nft: 1,
    dateIndex: 1,
    endTime: 1
  },
  {
    activityType: 1,
    endTime: 1,
    dateIndex: 1
  },
  {
    nft: 1,
    activityType: 1,
    dateIndex: 1
  },
  {
    nft: 1,
    activityType: 1,
    endTime: 1
  },
  {
    corpId: 1,
    point: 1
  },
  {
    activityType: 1,
    dateIndex: 1,
    corpId: 1
  },
  {
    activityType: 1,
    corpId: 1,
    endTime: 1,
    startTime: 1
  },
  {
    activityType: 1,
    corpId: 1
  },
  { user: 1 },
  { distance: 1 },
  { point: 1 }
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
