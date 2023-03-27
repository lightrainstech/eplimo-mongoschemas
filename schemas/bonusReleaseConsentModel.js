const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const BonusReleaseConsentSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true, unique: true },
    mode: {
      type: String,
      require: true,
      enum: ['linear-release', 'admin-stake']
    },
    isAgree: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

BonusReleaseConsentSchema.methods = {
  checkForConsent: async user => {
    const BonusReleaseConsent = mongoose.model('BonusReleaseConsent')
    return await BonusReleaseConsent.find({ user }).limit(1).lean()
  }
}

module.exports = mongoose.model(
  'BonusReleaseConsent',
  BonusReleaseConsentSchema
)
