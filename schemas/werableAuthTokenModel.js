const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const WearableAuthTokenSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      unique: true
    },
    providerUserId: {
      type: String,
      default: ''
    },
    provider: {
      type: String,
      default: ''
    },
    status: {
      type: String
    }
  },
  { timestamps: true }
)

WearableAuthTokenSchema.methods = {
  saveAuthDetails: async function (args) {
    try {
      const { user, provider, providerUserId, status } = args
      const WearableAuthTokenModel = mongoose.model('WearableAuthToken')
      const wearableModel = new WearableAuthTokenModel()
      wearableModel.user = user
      wearableModel.provider = provider
      wearableModel.providerUserId = providerUserId
      wearableModel.status = status
      return await status.save()
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('WearableAuthToken', WearableAuthTokenSchema)
