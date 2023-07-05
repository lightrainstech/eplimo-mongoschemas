const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

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
  },
  getLinearReleaseSubmission: async user => {
    const BonusReleaseConsent = mongoose.model('BonusReleaseConsent')
    return await BonusReleaseConsent.findOne({ user, mode: 'linear-release' })
  },
  updateSubmission: async args => {
    const { user, consentId } = args
    const BonusReleaseConsent = mongoose.model('BonusReleaseConsent')
    return await BonusReleaseConsent.findOneAndUpdate(
      {
        user: ObjectId(user),
        _id: ObjectId(consentId),
        mode: 'linear-release'
      },
      {
        $set: {
          mode: 'admin-stake'
        }
      },
      { new: true }
    )
  }
}

BonusReleaseConsentSchema.index({ user: 1 }, { _id: 1, user: 1 })

module.exports = mongoose.model(
  'BonusReleaseConsent',
  BonusReleaseConsentSchema
)
