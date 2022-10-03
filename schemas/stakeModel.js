const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const StakeSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    limos: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
)

LimoStakeSchema.methods = {
  updateStatus: async function (id, txnhash, releaseTime) {
    const StakeModel = mongoose.model('Stake')
    return await StakeModel.findOneAndUpdate(
      { wallet: wallet },
      { $inc: { sneakerLife: -totalDistance } },
      { new: true }
    )
  }
}

module.exports = mongoose.model('Stake', StakeSchema)
