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
    stakeAmount: {
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
    }
  },
  { timestamps: true }
)

LimoStakeSchema.methods = {
  updateStatus: async function (id, txnhash) {
    const LimoStakeModel = mongoose.model('LimoStake')
    return await LimoStakeModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          txnHash: txnhash,
          isProcessed: true
        }
      },
      { new: true }
    )
  }
}

module.exports = mongoose.model('LimoStake', LimoStakeSchema)
