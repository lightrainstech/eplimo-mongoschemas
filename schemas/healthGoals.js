const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const HealthGoalsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    eventType: {
      type: String
    },
    goalId: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    },
    data: {
      type: Object
    }
  },
  { timestamps: true }
)

HealthGoalsSchema.methods = {
  saveRecord: async function (args) {
    try {
      const HealthGoalsModel = mongoose.model('HealthGoals')
      const { userId, eventType, data, goalId } = args
      return await HealthGoalsModel.findOneAndUpdate(
        { goalId, eventType, userId },
        {
          $set: {
            data: data
          }
        },
        { new: true, upsert: true }
      )
    } catch (error) {
      throw error
    }
  },
  getLatestNutritionGoals: async function (userId) {
    try {
      const HealthGoalsModel = mongoose.model('HealthGoals')
      return await HealthGoalsModel.find(
        { userId, eventType: 'goal.dailyNutrition.updated' },
        {
          data: 1,
          date: 1
        }
      ).sort({ date: -1 })
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('HealthGoals', HealthGoalsSchema)
