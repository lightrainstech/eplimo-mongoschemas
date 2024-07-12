const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const HealthInfoSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    dataType: {
      type: String
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    data: {
      type: Object
    },
    provider: {
      type: String
    },
    dataProviderId: {
      type: String
    }
  },
  { timestamps: true }
)

HealthInfoSchema.methods = {
  saveData: async function (data) {
    try {
      const HealthInfo = mongoose.model('HealthInfo')
      return await HealthInfo.findOneAndUpdate(
        {
          user: ObjectId(data.user),
          dataType: data.type,
          startTime: { $eq: data.startTime },
          endTime: { $eq: data.endTime }
        },
        {
          $set: {
            data: data.data,
            provider: data.provider,
            startTime: data.startTime,
            endTime: data.endTime,
            dataProviderId: data.dataProviderId
          }
        },
        {
          new: true,
          upsert: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  getHealthInfo: async function (userId, startDate, endDate) {
    try {
      const HealthInfo = mongoose.model('HealthInfo')
      return await HealthInfo.aggregate([
        {
          $match: {
            user: ObjectId(userId),
            $and: [
              { endTime: { $gte: startDate } },
              {
                endTime: { $lte: endDate }
              }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $unwind: '$data'
        },
        {
          $group: {
            _id: '$dataType',
            documents: { $first: '$data' },
            user: { $first: '$user' },
            dataProviderId: { $first: '$dataProviderId' },
            documentId: { $first: '$_id' }
          }
        },
        {
          $project: {
            _id: 0,
            dataType: '$_id',
            documents: 1,
            user: 1,
            dataProviderId: 1,
            documentId: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

HealthInfoSchema.index(
  {
    user: 1,
    startTime: 1
  },
  {
    user: 1,
    dataType: 1,
    startTime: 1,
    endTime: 1
  }
)
module.exports = mongoose.model('HealthInfo', HealthInfoSchema)
