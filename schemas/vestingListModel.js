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

VestingListModelSchema.methods = {
  getVestedAmount: async function (email) {
    const VestingList = mongoose.model('VestingList')
    const result = await VestingList.findOne({ email })
    return result
  }
}

VestingListModelSchema.index({
  email: 1
})

module.exports = mongoose.model('VestingList', VestingListModelSchema)
