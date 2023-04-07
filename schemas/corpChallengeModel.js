const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const CorpChallengeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: '--'
    },
    description: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    image: {
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    }
  },
  { timestamps: true }
)

CorpChallengeSchema.methods = {}

CorpChallengeSchema.index({})

module.exports = mongoose.model('CorpChallenge', CorpChallengeSchema)
