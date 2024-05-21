const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const HealthInfoSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    dataType: {
      type: String
    },
    date: {
      type: Date
    },
    data: {
      type: Object
    },
    provider: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('HealthInfo', HealthInfoSchema)
