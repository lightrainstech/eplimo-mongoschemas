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
    isActive: {
      type: Boolean
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
      wearableModel.isActive = status
      return await wearableModel.save()
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('WearableAuthToken', WearableAuthTokenSchema)
