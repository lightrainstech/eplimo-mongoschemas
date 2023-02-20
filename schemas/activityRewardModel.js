const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

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
  getSneakerEarnings: async function (nftId, userId, date) {
    try {
      const ActivityReward = mongoose.model('ActivityReward')
      let criteria = {}
      criteria.nft = nftId
      if (date !== null) {
        criteria.date = {
          $gte: date
        }
      }
      return await ActivityReward.aggregate([
        {
          $match: criteria
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$limos'
            }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

ActivityRewardSchema.index({
  nft: 1,
  user: 1,
  date: 1
})

module.exports = mongoose.model('ActivityReward', ActivityRewardSchema)
