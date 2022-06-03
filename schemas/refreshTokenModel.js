const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    token: {
      type: String
    },
    exp: {
      type: Date,
      default: new Date(
        Date.now() + process.env.JWT_REFRESH_TOKEN_EXPIRY * 1000
      )
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)
