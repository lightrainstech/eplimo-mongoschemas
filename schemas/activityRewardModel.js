const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const ActivityRewardSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    nft: {
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
    date: {
      type: Date
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
  },
  getSneakerEarnings: async function (nftId, date) {
    try {
      const ActivityReward = mongoose.model('ActivityReward')
      let criteria = {}
      criteria.nft = ObjectId(nftId)
      if (date !== null) {
        criteria.date = {
          $gte: date
        }
      }
      return await ActivityReward.aggregate([
        {
          $match: criteria
        },
        { $group: { _id: '$date', dailyRewards: { $sum: '$limos' } } },
        {
          $group: {
            _id: '$_id.rewards',
            totalRewards: {
              $sum: '$dailyRewards'
            },
            data: { $addToSet: '$_id' }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

ActivityRewardSchema.index(
  {
    nft: 1,
    date: 1
  },
  { nft: 1 }
)

module.exports = mongoose.model('ActivityReward', ActivityRewardSchema)
