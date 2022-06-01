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
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('LimoStake', LimoStakeSchema)
