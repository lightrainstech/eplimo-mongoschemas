const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const BonusReleaseStatusRecordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    mode: {
      type: String,
      require: true,
      enum: ['linear-release', 'admin-stake']
    },
    status: {
      type: String,
      require: true,
      enum: ['pending', 'progress', 'completed']
    },
    counter: {
      type: Number,
      default: 0
    },
    wallet: {
      type: String
    }
  },
  { timestamps: true }
)

BonusReleaseStatusRecordSchema.index({ email: 1 })

module.exports = mongoose.model(
  'BonusReleaseStatusRecord',
  BonusReleaseStatusRecordSchema
)
