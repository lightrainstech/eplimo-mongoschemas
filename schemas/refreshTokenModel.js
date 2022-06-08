const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const refreshTokenSchema = {
  token: {
    type: String
  },
  exp: {
    type: Date,
    default: new Date(Date.now() + process.env.JWT_REFRESH_TOKEN_EXPIRY * 1000)
  }
}

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    refreshTokens: [refreshTokenSchema]
  },
  { timestamps: true }
)

RefreshTokenSchema.methods = {
  addRefreshToken: async function (userId, data) {
    const RefreshToken = mongoose.model('RefreshToken')
    return RefreshToken.findOneAndUpdate(
      { user: userId },
      { $addToSet: { refreshTokens: data } },
      { upsert: true, new: true }
    )
      .lean()
      .exec()
  },
  revokeRefreshToken: function (userId, tokenId) {
    console.log(userId, tokenId)
    const RefreshToken = mongoose.model('RefreshToken')
    return RefreshToken.findOneAndUpdate(
      { user: ObjectId(userId) },
      { $pull: { refreshTokens: { token: tokenId } } },
      { new: true }
    )
      .lean()
      .exec()
  }
}

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)
