const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const LimoPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '---'
    },
    email: {
      type: String,
      required: true
    },
    limo: {
      type: Number,
      default: 0
    },
    wallet: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

LimoPointSchema.methods = {
  getuserLimo: async function (wallet) {
    const Reward = mongoose.model('LimoReward')
    return await Reward.findOne({ wallet: wallet }, { limo: 1 })
  }
}

LimoPointSchema.index({
  wallet: 1
})

module.exports = mongoose.model('LimoPoint', LimoPointSchema)
