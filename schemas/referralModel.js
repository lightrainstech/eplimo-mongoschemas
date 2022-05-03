const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ReferralSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 8
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      default: '---'
    },
    wallet: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
)

ReferralSchema.methods = {
  getByEmail: async function (email) {
    const referral = mongoose.model('Referral')
    return await referral.findOne({ email: email })
  },
  getByWallet: async function (wallet) {
    const referral = mongoose.model('Referral')
    return await referral.findOne({ wallet: wallet })
  }
}

module.exports = mongoose.model('Referral', ReferralSchema)
