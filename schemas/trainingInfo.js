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
    data: {
      type: Object
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

TrainingInfoSchema.methods = {
  saveRecord: async function (args) {
    try {
      const TrainingInfoModel = mongoose.model('TrainingInfo')
      const { userId, eventType, dailyWorkoutId, data, date } = args
      return await TrainingInfoModel.findOneAndUpdate(
        { dailyWorkoutId, eventType, userId },
        {
          $set: {
            data: data,
            date: date
          }
        },
        { new: true, upsert: true }
      )
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('TrainingInfo', TrainingInfoSchema)
