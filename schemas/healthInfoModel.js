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
      const criteria = {
        user: ObjectId(userId),
        endTime: { $lte: new Date(endDate) }
        // $and: [
        //   { startTime: { $gte: new Date(startDate) } },
        //   {
        //     endTime: { $lte: new Date(endDate) }
        //   }
        // ]
      }
      return await HealthInfo.aggregate([
        {
          $match: criteria
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
  },
  getHealthInfoByRange: async function (userId, startDate, endDate) {
    try {
      const HealthInfo = mongoose.model('HealthInfo')
      const criteria = {
        user: ObjectId(userId),
        $and: [
          { startTime: { $gte: new Date(startDate) } },
          {
            endTime: { $lte: new Date(endDate) }
          }
        ]
      }
      return await HealthInfo.aggregate([
        {
          $match: criteria
        },
        {
          $sort: { startTime: -1 }
        },
        {
          $unwind: '$data'
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              }
              //dataType: '$dataType'
            },
            documents: { $push: '$data' },
            user: { $first: '$user' },
            dataProviderId: { $first: '$dataProviderId' },
            documentId: { $first: '$_id' },
            dataType: { $first: '$dataType' }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            dataType: '$_id.dataType',
            documents: 1,
            user: 1,
            dataProviderId: 1,
            documentId: 1
          }
        },
        {
          $sort: { date: -1 }
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
