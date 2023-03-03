const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ThryveAuthTokenSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
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

module.exports = mongoose.model('ThryveAuthToken', ThryveAuthTokenSchema)
