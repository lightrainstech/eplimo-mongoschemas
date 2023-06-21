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
    },
    wallet: {
      type: String,
      default: ''
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
  },
  updateSubmission: async function (data) {
    try {
      let { submissionId, amount, wallet, email } = data
      const StakingReward = mongoose.model('StakingReward')
      return StakingReward.findOneAndUpdate(
        {
          email: email,
          _id: submissionId
        },
        {
          amount: amount,
          wallet: wallet
        },
        { new: true }
      )
    } catch (error) {
      throw e
    }
  }
}

module.exports = mongoose.model('StakingReward', StakingRewardSchema)
