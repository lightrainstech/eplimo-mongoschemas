const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 86400
  }
})

RefreshTokenSchema.methods = {
  addRefreshToken: async function (userId, token) {
    const RefreshToken = mongoose.model('RefreshToken'),
      refreshTokenModel = new RefreshToken()
    try {
      refreshTokenModel.user = userId
      refreshTokenModel.token = token
      return await refreshTokenModel.save()
    } catch (err) {
      throw err
    }
  },
  removeRefreshTokenByUser: async function (userId) {
    const RefreshToken = mongoose.model('RefreshToken'),
      result = await RefreshToken.findOneAndRemove({ user: userId })
    return result
  },
  findByRefreshToken: async function (tokenId) {
    const RefreshToken = mongoose.model('RefreshToken')
    return await RefreshToken.findOne({ token: tokenId })
  },
  removeRefreshToken: async function (tokenId) {
    const RefreshToken = mongoose.model('RefreshToken'),
      result = await RefreshToken.findOneAndRemove({ token: tokenId })
    return result
  }
}

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)
