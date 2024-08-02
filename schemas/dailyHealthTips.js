const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const DailyHealthTipsSchema = new mongoose.Schema(
  {
    image: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    tip: {
      type: String
    }
  },
  { timestamps: true }
)

DailyHealthTipsSchema.methods = {
  getTips: async function () {
    try {
      const Tips = mongoose.model('DailyHealthTips')
      return await Tips.find({})
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('DailyHealthTips', DailyHealthTipsSchema)
