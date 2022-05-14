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
    },
    limoT: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

RewardSchema.methods = {
  getuserLimoR: async function (userId) {
    const Reward = mongoose.model('Reward')
    return await Reward.findOne({ userId: userId }, { limoR: 1 })
  },
  updateRewardPoints: async function (userId, stakeAmount) {
    stakeAmount = Number(stakeAmount) * -1
    console.log(stakeAmount)
    const Reward = mongoose.model('Reward')
    return await Reward.findOneAndUpdate(
      { userId: userId },
      {
        $inc: { limoR: stakeAmount }
      },
      { new: true }
    )
  }
}

module.exports = mongoose.model('Reward', RewardSchema)
