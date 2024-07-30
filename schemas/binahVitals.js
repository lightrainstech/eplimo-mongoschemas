const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const BinahVitalsSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    data: {
      type: Object
    },
    dataProviderId: {
      type: String
    },
    dataProvider: {
      type: String
    }
  },
  { timestamps: true }
)

BinahVitalsSchema.methods = {
  getScanHistory: async function (page, user) {
    try {
      const ScanHistory = mongoose.model('BinahVitals')
      let limit = 18
      page = page === 0 ? 0 : page - 1
      return await ScanHistory.find({
        user
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * page)
    } catch (error) {
      throw error
    }
  },
  getScanHistoryByRange: async function (args) {
    try {
      let { userId, startDate, endDate } = args
      const ScanHistory = mongoose.model('BinahVitals')

      return await ScanHistory.find({
        user: userId,
        $and: [
          { createdAt: { $gte: new Date(startDate) } },
          { createdAt: { $lte: new Date(endDate) } }
        ]
      })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('BinahVitals', BinahVitalsSchema)
