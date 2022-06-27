const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const RewardSchema = new mongoose.Schema(
  {
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
    return await Reward.findOne({ email: email }, { limoR: 1 }).lean()
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
  },
  updateEmail: async function (oldEmail, newEmail) {
    const Reward = mongoose.model('Reward')
    return await Reward.findOneAndUpdate(
      { email: oldEmail },
      {
        $set: {
          email: newEmail
        }
      },
      { new: true }
    )
  },
  getLimoRList: async function () {
    const Reward = mongoose.model('Reward')
    return await Reward.find({}, { name: 1, email: 1, phone: 1, limoR: 1 })
  }
}

module.exports = mongoose.model('Reward', RewardSchema)
