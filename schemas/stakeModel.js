const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const StakeSchema = new mongoose.Schema(
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

StakeSchema.methods = {
  getStakeByWallets: async function (wallet) {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.findOne({ wallet: wallet }, { wallet: 1, stake: 1 })
  },
  getAllStake: async function () {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.find({}, { wallet: 1, stake: 1 })
  }
}

module.exports = mongoose.model('Stake', StakeSchema)
