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
  getuserLimoR: async function (email) {
    const Reward = mongoose.model('Reward')
    return await Reward.findOne({ email: email }, { limoR: 1 })
  },
  updateRewardPoints: async function (email, stakeAmount) {
    stakeAmount = Number(stakeAmount) * -1
    const Reward = mongoose.model('Reward')
    return await Reward.findOneAndUpdate(
      { email: email },
      {
        $inc: { limoR: stakeAmount }
      },
      { new: true }
    )
  }
}

module.exports = mongoose.model('Reward', RewardSchema)
