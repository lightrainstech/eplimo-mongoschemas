const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const BonusReleaseConsentSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
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

module.exports = mongoose.model(
  'BonusReleaseConsent',
  BonusReleaseConsentSchema
)
