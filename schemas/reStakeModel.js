const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ReStakeSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    stake: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
)

ReStakeSchema.methods = {
  updateStake: async function (wallet, stake) {
    const ReStakeModel = mongoose.model('ReStake')
    return await ReStakeModel.findOneAndUpdate(
      { wallet: wallet },
      { $inc: { limos: stake } },
      { new: true }
    )
  },
  getStakeByWallet: async function (wallet, stake) {
    const ReStakeModel = mongoose.model('ReStake')
    return await ReStakeModel.find({}, { wallet: 1, stake: 1 })
  },
  getAllStake: async function () {
    const ReStakeModel = mongoose.model('ReStake')
    return await ReStakeModel.find({}, { wallet: 1, stake: 1 })
  }
}

module.exports = mongoose.model('ReStake', ReStakeSchema)
