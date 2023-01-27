const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const YieldHistorySchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    reward: {
      type: Number,
      default: 0.0
    },
    dateIndex: {
      type: String
    }
  },
  { timestamps: true }
)

YieldHistorySchema.methods = {}

YieldHistorySchema.index({
  wallet: 1
})

module.exports = mongoose.model('YieldHistory', YieldHistorySchema)
