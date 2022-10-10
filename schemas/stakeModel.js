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
    },
    txnHash: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
)

StakeSchema.methods = {
  addStake: async function (wallet, stake, txnHash) {
    stake = Number(stake)
    const Stake = mongoose.model('Stake'),
      stakeModel = new Stake()
    stake.wallet = wallet
    stake.stake = stake
    stake.txnHash = txnHash
    return await stake.save()
  },
  getStakeByWallets: async function (wallet) {
    const StakeModel = mongoose.model('Stake')
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
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.aggregate([
      {
        $match: {}
      },
      { $group: { _id: '$wallet', sum: { $sum: '$stake' } } }
    ])
  }
}
StakeSchema.index({
  wallet: 1
})

module.exports = mongoose.model('Stake', StakeSchema)
