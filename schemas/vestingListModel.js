const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const VestingListModelSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    limo: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
)

VestingListModelSchema.methods = {}

VestingListModelSchema.index({
  email: 1
})

module.exports = mongoose.model('VestingList', VestingListModelSchema)
