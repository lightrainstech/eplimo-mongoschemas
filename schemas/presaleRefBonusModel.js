const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const presaleRefBonusSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    wallet: {
      type: String,
      required: true
    },
    bonus: {
      type: Number,
      default: 0
    },
    isProcessed: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

presaleRefBonusSchema.methods = {
  getPresaleReferralBonus: async function (email) {
    const PresaleRefBonus = mongoose.model('presaleRefBonus')
    return await PresaleRefBonus.findOne({ email }, { _id: -1 }).lean()
  }
}

module.exports = mongoose.model('presaleRefBonus', presaleRefBonusSchema)
