const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const LimoStakeSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    limos: {
      type: Number,
      default: 0.0
    },
    isProcessed: {
      type: Boolean,
      default: false
    },
    txnHash: {
      type: String,
      default: '0x0'
    },
    date: {
      type: String,
      default: '--'
    },
    releaseTime: {
      type: String
    }
  },
  { timestamps: true }
)

LimoStakeSchema.methods = {
  updateStatus: async function (id, txnhash, releaseTime) {
    const LimoStakeModel = mongoose.model('LimoStake')
    return await LimoStakeModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          txnHash: txnhash,
          isProcessed: true,
          releaseTime: releaseTime
        }
      },
      { new: true }
    )
  },
  getReleaseTime: async function (wallet) {
    const LimoStakeModel = mongoose.model('LimoStake')
    return await LimoStakeModel.findOne(
      { wallet: wallet },
      { releaseTime: 1 }
    ).sort({ createdAt: 1 })
  }
}

module.exports = mongoose.model('LimoStake', LimoStakeSchema)
