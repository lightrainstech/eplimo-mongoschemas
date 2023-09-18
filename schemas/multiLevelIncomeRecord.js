const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const MultiLevelIncomeRecordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    wallet: {
      type: String
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    commission: {
      type: Number,
      default: 0
    },
    saleType: {
      type: String
    },
    usdInBnb: {
      type: Number
    },
    limoInBnb: {
      type: Number
    }
  },
  { timestamps: true }
)

MultiLevelIncomeRecordSchema.methods = {
  getCommissionStat: async function (email) {
    try {
      const Record = mongoose.model('MultiLevelIncomeRecord')
      return await Record.aggregate([
        {
          $match: { email: email }
        },
        {
          $group: {
            _id: '$saleType',
            totalCommission: { $sum: '$commission' },
            latestEndDate: { $max: '$endDate' }
          }
        },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: '$totalCommission' },
            commissionBySaleType: {
              $push: { saleType: '$_id', totalCommission: '$totalCommission' }
            },
            latestEndDate: { $max: '$latestEndDate' }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}
MultiLevelIncomeRecordSchema.index({ email: 1 })

module.exports = mongoose.model(
  'MultiLevelIncomeRecord',
  MultiLevelIncomeRecordSchema
)
