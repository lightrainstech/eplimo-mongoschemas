const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const StakingRewardSchema = new mongoose.Schema(
  {
    userId: {
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

module.exports = mongoose.model('StakingReward', StakingRewardSchema)
