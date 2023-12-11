const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const B2BSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    b2b: {
      type: Schema.ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

B2BSchema.methods = {
  getUsersByB2B: async b2bId => {
    try {
      const B2BUsers = mongoose.model('B2B')
      return await B2BUsers.aggregate([
        {
          $lookup: {
            from: 'users', // The name of the referenced collection ('users' in this case)
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $match: {
            $expr: {
              $eq: [{ $arrayElemAt: ['$userInfo.referalCode', 0] }, '']
            }
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            name: `$userInfo.name`,
            userName: `$userInfo.userName`,
            email: `$userInfo.email`
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  getInfluencersByB2B: async b2bId => {
    try {
      const B2BUsers = mongoose.model('B2B')
      return await B2BUsers.aggregate([
        {
          $lookup: {
            from: 'users', // The name of the referenced collection ('users' in this case)
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $match: {
            $expr: {
              $ne: [{ $arrayElemAt: ['$userInfo.referalCode', 0] }, '']
            }
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            name: `$userInfo.name`,
            userName: `$userInfo.userName`,
            email: `$userInfo.email`,
            referralCode: `$userInfo.referalCode`
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('B2B', B2BSchema)
