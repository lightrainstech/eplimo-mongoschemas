const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const AiCoachingInfoSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    data: {
      type: Object
    },
    dataProviderId: {
      type: String
    },
    dataProvider: {
      type: String
    }
  },
  { timestamps: true }
)

AiCoachingInfoSchema.methods = {
  getTrainingHistory: async function (args) {
    try {
      let { page, user, startDate, endDate, isChallenge } = args
      let criteria = {}

      if (startDate && endDate) {
        criteria = {
          user: user,
          $and: [
            { createdAt: { $gte: new Date(startDate) } },
            { createdAt: { $lte: new Date(endDate) } }
          ]
        }
      } else {
        criteria.user = user
      }
      if (isChallenge) {
        criteria = { ...criteria, data: { isChallenge: true } }
      }
      const TraininigHistory = mongoose.model('AiCoachingInfo')
      let limit = 18
      page = page === 0 ? 0 : page - 1
      return await TraininigHistory.find(criteria)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * page)
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('AiCoachingInfo', AiCoachingInfoSchema)
