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

SpotLightSchema.methods = {
  getSpotlights: async function () {
    try {
      const spotLigtModel = mongoose.model('SpotLight')
      return await spotLigtModel.find().sort({ createdAt: -1 })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('SpotLight', SpotLightSchema)
