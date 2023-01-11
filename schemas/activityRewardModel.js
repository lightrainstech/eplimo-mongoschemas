const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ActivityRewardSchema = new mongoose.Schema(
  {
    user: {
      type: String
    },
    wallet: {
      type: String,
      required: true
    },
    limos: {
      type: Number
    },
    isTrial: {
      type: Boolean,
      default: false
    },
    dateIndex: {
      type: String
    }
  },
  { timestamps: true }
)

ActivityRewardSchema.methods = {
  inserRecord
}

module.exports = mongoose.model('ActivityReward', ActivityRewardSchema)
