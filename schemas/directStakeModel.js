const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const DirectStakeSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true
    },
    stake: {
      type: Number,
      default: 0.0
    },
    txnHash: {
      type: String,
      required: true,
      unique: true
    },
    referralCode: {
      type: String,
      default: ''
    },
    dateIndex: {
      type: String
    }
  },
  { timestamps: true }
)

DirectStakeSchema.methods = {
  getStakesusingReferral: async function (referralCode) {
    try {
      const DirectStake = mongoose.model('DirectStake')
      return await DirectStake.find({ referralCode })
    } catch (error) {
      throw error
    }
  },
  getStakesOfTheWeek: async function (startDate, endDate) {
    try {
      const DirectStake = mongoose.model('DirectStake')
      return await DirectStake.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'users', // Name of the user collection
            localField: 'referralCode', // Field in the purchase collection referencing the user's referralCode
            foreignField: 'referalCode', // Field in the user collection
            as: 'user_details' // Alias for the joined data
          }
        },
        {
          $unwind: '$user_details'
        },
        {
          $group: {
            _id: '$referralCode',
            total_stakes: { $sum: '$stake' },
            user_details: { $first: '$user_details' }
          }
        },
        {
          $project: {
            _id: 0,
            referralCode: '$_id',
            total_stakes: 1,
            user_details: { email1: 1, _id: 1, custodyWallet: 1 }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}
DirectStakeSchema.index(
  {
    wallet: 1
  },
  {
    txnHash: 1
  },
  {
    referralCode: 1
  },
  { stake: 1 }
)

module.exports = mongoose.model('DirectStake', DirectStakeSchema)
