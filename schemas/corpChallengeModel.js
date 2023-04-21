const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const CorpChallengeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: '--'
    },
    description: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    image: {
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    },
    corpId: {
      type: ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

CorpChallengeSchema.methods = {
  getChallengeById: async function (corpId, challengeId) {
    const challengeModel = mongoose.model('CorpChallenge')
    return await challengeModel.aggregate([
      {
        $match: {
          _id: ObjectId(challengeId)
        }
      },
      {
        $lookup: {
          from: 'corpchallengeparticipants',
          localField: '_id',
          foreignField: 'challenge',
          as: 'participants'
        }
      }
    ])
  },
  getAllChallengesByCorp: async function (corpId, page) {
    const challengeModel = mongoose.model('CorpChallenge')
    let options = { criteria: { corpId: ObjectId(corpId) }, page: Number(page) }
    console.log(options)
    return await challengeModel.listForPagination(options)
  },
  getChallengeParticipants: async function (challengeId, page) {
    const ChallengeModel = mongoose.model('CorpChallenge')
    return await ChallengeModel.aggregate([
      {
        $match: {
          _id: ObjectId(challengeId)
        }
      },
      {
        $lookup: {
          from: 'corpchallengeparticipants',
          localField: '_id',
          foreignField: 'challenge',
          as: 'participants'
        }
      },
      { $unwind: '$participants' },
      {
        $lookup: {
          from: 'activities',
          localField: 'participants.user',
          foreignField: 'user',
          as: 'userActivity'
        }
      },
      { $unwind: '$userActivity' },
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ['$userActivity.startTime', '$startDate'] },
              {
                $eq: ['$userActivity.nft', '$participants.nft']
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            userActivity: '$userActivity'
          }
        }
      },
      {
        $group: {
          _id: { user: '$_id.userActivity.user', nft: '$_id.userActivity.nft' },
          totalDistance: { $sum: '$_id.userActivity.distance' },
          totalPoints: { $sum: '$_id.userActivity.point' }
        }
      },
      {
        $lookup: {
          from: 'assets',
          localField: '_id.nft',
          foreignField: '_id',
          as: 'assetData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$assetData' },
      {
        $addFields: {
          'userData.totalDistance': '$totalDistance',
          'userData.totalPoints': '$totalPoints'
        }
      },
      {
        $addFields: {
          'userData.category': '$assetData.category',
          'userData.efficiencyIndex': '$assetData.efficiencyIndex'
        }
      },
      {
        $project: {
          'userData.name': 1,
          'userData.email': 1,
          'userData.avatar': 1,
          'userData.totalDistance': 1,
          'userData.totalPoints': 1,
          'userData.category': 1,
          'userData.efficiencyIndex': 1
        }
      }
    ])
  }
}
CorpChallengeSchema.statics = {
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

CorpChallengeSchema.index({
  _id: 1,
  corpId: 1
})

module.exports = mongoose.model('CorpChallenge', CorpChallengeSchema)
