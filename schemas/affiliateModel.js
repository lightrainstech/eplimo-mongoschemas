const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const AffiliateSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 12
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

AffiliateSchema.methods = {
  getReferralCodeList: async function (email) {
    const affiliate = mongoose.model('Affiliate')
    return await affiliate.find({}).sort({ createdAt: 1 })
  },
  getByEmail: async function (email) {
    const affiliate = mongoose.model('Affiliate')
    return await affiliate.findOne({ email: email })
  },
  getByWallet: async function (wallet) {
    const affiliate = mongoose.model('Affiliate')
    return await affiliate.findOne({ wallet: wallet })
  }
}

AffiliateSchema.index(
  {
    email: 1
  },
  { wallet: 1 }
)

module.exports = mongoose.model('Affiliate', AffiliateSchema)
