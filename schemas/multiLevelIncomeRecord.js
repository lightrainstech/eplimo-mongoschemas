const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const MultiLevelIncomeRecordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
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

MultiLevelIncomeRecordSchema.index({ email: 1 })

module.exports = mongoose.model(
  'MultiLevelIncomeRecord',
  MultiLevelIncomeRecordSchema
)
