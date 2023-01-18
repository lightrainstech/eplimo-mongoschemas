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
      index: {
        unique: true,
        partialFilterExpression: { txnHash: { $type: 'string' } }
      },
      default: null
    }
  },
  { timestamps: true }
)

StakeSchema.methods = {
  addStake: async function (wallet, stake, txnHash) {
    stake = Number(stake)
    const Stake = mongoose.model('Stake'),
      stakeModel = new Stake()
    stakeModel.wallet = wallet
    stakeModel.stake = stake
    stakeModel.txnHash = txnHash
    return await stakeModel.save()
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
      {
        $group: { _id: '$wallet', sum: { $sum: '$stake' } }
      }
    ])
  },
  getTotalStake: async function () {
    const StakeModel = mongoose.model('Stake')
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
  },
  getByTransactionHash: async function (txnHash) {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.findOne({ txnHash })
  }
}
StakeSchema.index(
  {
    wallet: 1
  },
  {
    txnHash: 1
  }
)

module.exports = mongoose.model('LimoStake', StakeSchema)
