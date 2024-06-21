const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const BinahVitalsSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('BinahVitals', BinahVitalsSchema)
