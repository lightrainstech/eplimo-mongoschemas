const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const TrainingInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    eventType: {
      type: String
    },
    dailyWorkoutId: {
      type: String,
      default: null
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    data: {
      type: Object
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('TrainingInfo', TrainingInfoSchema)
