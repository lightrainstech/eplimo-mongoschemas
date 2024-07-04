const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const AiCoachingInfoSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    data: {
      type: Object
    },
    dataProviderId: {
      type: String
    },
    dataProvider: {
      type: String
    }
  },
  { timestamps: true }
)

AiCoachingInfoSchema.methods = {}

module.exports = mongoose.model('AiCoachingInfo', AiCoachingInfoSchema)
