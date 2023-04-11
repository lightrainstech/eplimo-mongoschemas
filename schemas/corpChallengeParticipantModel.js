const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const CorpChallengeParticipantSchema = new mongoose.Schema(
  {
    challenge: {
      type: ObjectId,
      ref: 'CorpChallenge',
      required: true
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    corpId: {
      type: ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

CorpChallengeParticipantSchema.methods = {}

CorpChallengeParticipantSchema.index({})

module.exports = mongoose.model(
  'CorpChallengeParticipant',
  CorpChallengeParticipantSchema
)
