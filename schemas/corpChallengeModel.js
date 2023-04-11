const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

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
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    image: {
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    },
    corpId: {
      type: ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

CorpChallengeSchema.methods = {
  getChallengeById: async function (corpId, challengeId) {
    const challengeModel = mongoose.model('CorpChallenge')
    return await challengeModel.find({
      _id: ObjectId(challengeId),
      corpId: ObjectId(corpId)
    })
  }
}

CorpChallengeSchema.index({
  _id: 1,
  corpId: 1
})

module.exports = mongoose.model('CorpChallenge', CorpChallengeSchema)
