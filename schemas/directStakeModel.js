const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const DirectStakeSchema = new mongoose.Schema(
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
    },
    referralCode: {
      type: String,
      required: true,
      default: ''
    },
    dateIndex: {
      type: String
    }
  },
  { timestamps: true }
)

DirectStakeSchema.methods = {
  getStakesusingReferral: async function (referralCode) {
    try {
      const DirectStake = mongoose.model('DirectStake')
      return await DirectStake.find({ referralCode })
    } catch (error) {
      throw error
    }
  }
}
DirectStakeSchema.index(
  {
    wallet: 1
  },
  {
    txnHash: 1
  },
  {
    referralCode: 1
  }
)

module.exports = mongoose.model('DirectStake', DirectStakeSchema)
