const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const NotificationAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    playerId: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
)

NotificationAuthSchema.methods = {
  saveAuth: async function (user, playerId) {
    try {
      const NotificationAuthModel = mongoose.model('NotificationAuth')
      return await NotificationAuthModel.findOneAndUpdate(
        {
          userId: ObjectId(user)
        },
        {
          $set: {
            playerId: playerId
          }
        },
        {
          upsert: true,
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('NotificationAuth', NotificationAuthSchema)
