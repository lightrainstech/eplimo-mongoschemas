const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const StakeReleaseConsentSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    mode: {
      type: Number,
      require: true,
      enum: [2, 3]
    },
    isAgree: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

StakeReleaseConsentSchema.methods = {
  checkForConsent: async wallet => {
    const StakeReleaseConsent = mongoose.model('StakeReleaseConsent')
    return await StakeReleaseConsent.find({ wallet }).limit(1).lean()
  }
}

module.exports = mongoose.model(
  'StakeReleaseConsent',
  StakeReleaseConsentSchema
)
