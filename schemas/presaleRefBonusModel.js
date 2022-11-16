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
    },
    month: {
      type: String
    }
  },
  { timestamps: true }
)

presaleRefBonusSchema.methods = {
  getPresaleReferralBonus: async function (email) {
    const PresaleRefBonus = mongoose.model('presaleRefBonus')
    return await PresaleRefBonus.find({ email }).lean()
  }
}
presaleRefBonusSchema.index({ email: 1 })
module.exports = mongoose.model('presaleRefBonus', presaleRefBonusSchema)
