const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const KYCSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    practitionerDoc: {
      type: String,
      default: '--'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('KYCSchema', KYCSchema)
