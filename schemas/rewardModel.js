const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const RewardSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      default: '---'
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: '---'
    },
    limo: {
      type: Number,
      default: 0
    },
    limoR: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

RewardSchema.methods = {
  getuserLimoR: async function (email) {
    const Reward = mongoose.model('Reward')
    return await Reward.findOne({ email: email }, { limoR: 1 })
  },
  updateRewardPoints: async function (rewardId, stakeAmount) {
    stakeAmount = Number(stakeAmount) * -1
    console.log(stakeAmount)
    const Reward = mongoose.model('Reward')
    return await Reward.findOneAndUpdate(
      { _id: rewardId },
      {
        $inc: { totalPoint: stakeAmount, limoR: stakeAmount }
      },
      { new: true }
    )
  }
}

module.exports = mongoose.model('Reward', RewardSchema)
