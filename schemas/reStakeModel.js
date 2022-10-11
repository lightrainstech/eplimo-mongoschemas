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
      { new: true, upsert: true }
    )
  },
  getStakeByWallets: async function (wallet) {
    const StakeModel = mongoose.model('ReStake')
    return await StakeModel.aggregate([
      {
        $match: {
          wallet: wallet
        }
      },
      { $group: { _id: null, sum: { $sum: '$stake' } } }
    ])
  },
  getAllStake: async function () {
    const StakeModel = mongoose.model('ReStake')
    return await StakeModel.aggregate([
      {
        $match: {}
      },
      {
        $group: { _id: '$wallet', sum: { $sum: '$stake' } }
      }
    ])
  }
}

ReStakeSchema.index({
  wallet: 1
})

module.exports = mongoose.model('ReStake', ReStakeSchema)
