const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const ThryveAuthTokenSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      unique: true
    },
    authToken: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

ThryveAuthTokenSchema.methods = {
  savethryveAuthToken: async function (user, token) {
    try {
      const ThryveAuthTokenModel = mongoose.model('ThryveAuthToken')
      let data = await ThryveAuthTokenModel.findOneAndUpdate(
        { user: ObjectId(user) },
        { $set: { authToken: token } },
        { new: true, upsert: true }
      )
      return data
    } catch (error) {
      throw error
    }
  },
  getAccessTokens: async function () {
    try {
      const ThryveAuthTokenModel = mongoose.model('ThryveAuthToken'),
        tokens = []
      return await ThryveAuthTokenModel.find({}, { _id: 0, authToken: 1 })
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('ThryveAuthToken', ThryveAuthTokenSchema)
