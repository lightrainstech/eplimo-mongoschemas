const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ActivityRewardSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    wallet: {
      type: String,
      required: true
    },
    limos: {
      type: Number
    },
    isTrial: {
      type: Boolean,
      default: false
    },
    dateIndex: {
      type: String
    }
  },
  { timestamps: true }
)

ActivityRewardSchema.methods = {
  insertRecord: async function (dataArray) {
    try {
      const ActivityReward = mongoose.model('ActivityReward')
      return await ActivityReward.insertMany(dataArray)
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('ActivityReward', ActivityRewardSchema)
