const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const twoxStakeSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
      unique: true
    },
    stake: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
)

twoxStakeSchema.methods = {
  add2xStake: async function (wallet, stake) {
    stake = Number(stake)
    const Stake = mongoose.model('TwoX')
    return Stake.findOneAndUpdate(
      {
        wallet: wallet
      },
      { $inc: { stake: stake } },
      { new: true, upsert: true }
    )
  },
  get2xStakeByWallets: async function (wallet) {
    const StakeModel = mongoose.model('TwoX')
    return await StakeModel.aggregate([
      {
        $match: {
          wallet: wallet
        }
      },
      { $group: { _id: null, sum: { $sum: '$stake' } } }
    ])
  },
  getAll2xStake: async function () {
    const StakeModel = mongoose.model('TwoX')
    return await StakeModel.aggregate([
      {
        $match: {}
      },
      {
        $group: { _id: '$wallet', sum: { $sum: '$stake' } }
      }
    ])
  },
  getTotal2xStake: async function () {
    const StakeModel = mongoose.model('TwoX')
    return await StakeModel.aggregate([
      {
        $group: {
          _id: 'totalStake',
          total: {
            $sum: '$stake'
          }
        }
      }
    ])
  }
}
twoxStakeSchema.index({
  wallet: 1
})

module.exports = mongoose.model('TwoX', twoxStakeSchema)
