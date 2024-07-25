const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const WearableAuthTokenSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User'
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
      return await WearableAuthTokenModel.findOneAndUpdate(
        {
          user: ObjectId(user),
          providerUserId: providerUserId,
          provider: provider
        },
        {
          $set: {
            isActive: status
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
  },
  checkAuth: async function (args) {
    try {
      const { user, providerUserId } = args
      const WearableAuthTokenModel = mongoose.model('WearableAuthToken')
      return await WearableAuthTokenModel.findOne({
        user: ObjectId(user),
        providerUserId: providerUserId,
        isActive: true
      })
    } catch (error) {
      throw error
    }
  },
  getConnectedDevice: async function (user) {
    try {
      const WearableAuthTokenModel = mongoose.model('WearableAuthToken')
      return await WearableAuthTokenModel.find({
        user: ObjectId(user),
        isActive: true
      })
    } catch (error) {
      throw error
    }
  }
}

//WearableAuthToken.index({ user: 1, provider: 1 }, { unique: true })
module.exports = mongoose.model('WearableAuthToken', WearableAuthTokenSchema)
