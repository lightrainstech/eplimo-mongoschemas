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
  getTrainingHistory: async function (page, user) {
    try {
      const TraininigHistory = mongoose.model('AiCoachingInfo')
      let limit = 18
      page = page === 0 ? 0 : page - 1
      return await TraininigHistory.find({
        user
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * page)
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('AiCoachingInfo', AiCoachingInfoSchema)
