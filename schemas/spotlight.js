const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const SpotLightSchema = new mongoose.Schema(
  {
    //user: { type: Schema.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: 'Anonymous' },
    title: { type: String, default: '' },
    video: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('SpotLight', SpotLightSchema)
