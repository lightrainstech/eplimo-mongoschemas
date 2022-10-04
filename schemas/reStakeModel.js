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
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.findOneAndUpdate(
      { wallet: wallet },
      { $inc: { limos: stake } },
      { new: true }
    )
  },
  getStakeByWallet: async function (wallet, stake) {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.find({}, { wallet: 1, stake: 1 })
  },
  getAllStake: async function () {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.find({}, { wallet: 1, stake: 1 })
  }
}

modusle.exports = mongoose.model('ReStake', ReStakeSchema)
