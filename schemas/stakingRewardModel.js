const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const StakingRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: 'User'
    },
    email: {
      type: String,
      required: true
    },
    rewardPoint: {
      type: Number,
      default: 0.0
    },
    stakeAmount: {
      type: Number,
      default: 0.0
    },
    exactStakedAmount: {
      type: Number,
      default: 0.0
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isProcesses: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

StakingRewardSchema.methods = {
  total2xReward: async function () {
    try {
      const StakingReward = mongoose.model('StakingReward')
      return StakingReward.aggregate([
        { $match: {} },
        { $group: { _id: null, sum: { $sum: '$exactStakedAmount' } } }
      ])
    } catch (e) {
      throw e
    }
  }
}

module.exports = mongoose.model('StakingReward', StakingRewardSchema)
