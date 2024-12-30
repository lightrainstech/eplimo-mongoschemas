const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const LftSalesSchema = new mongoose.Schema({
  wallet: {
    type: String
  },
  amount: {
    type: Number
  },
  items: {
    type: Number
  },
  orderId: {
    type: String,
    unique: true
  },
  paymentStatus: {
    type: String,
    default: 'pending'
  },
  paymentTxnHash: {
    type: String,
    default: null
  },
  assetId: {
    type: Array,
    default: []
  },
  referralCode: {
    type: String,
    default: null
  },
  purchasedBy: {
    type: String
  },
  referredBy: {
    type: String
  },
  txnData: {
    type: Object,
    default: {}
  },
  date: {
    type: String
  },
  lockedLimos: {
    type: Number,
    default: 0
  },
  limoPriceInUsd: {
    type: Number,
    default: 0
  }
})

LftSalesSchema.methods = {
  fetchSalesList: async function (args) {
    try {
      const { startDate, endDate } = args
      const LftSalesModel = mongoose.model('LftSales')
      return await LftSalesModel.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $project: {
            date: 1,
            itemCount: {
              $cond: {
                if: {
                  $and: [
                    { $isArray: '$assetId' },
                    { $gt: [{ $size: '$assetId' }, 0] }
                  ]
                },
                then: { $size: '$assetId' },
                else: 1
              }
            },
            items: 1,
            wallet: 1,
            amount: 1,
            paymentTxnHash: 1,
            assetId: 1,
            referralCode: 1,
            purchasedBy: 1,
            referredBy: 1,
            txnData: 1,
            date: 1,
            lockedLimos: 1,
            limoPriceInUsd: 1
          }
        },
        {
          $group: {
            _id: null,
            totalSoldItems: { $sum: '$itemCount' },
            salesData: { $push: '$$ROOT' },
            lockedLimos: { $sum: '$lockedLimos' }
          }
        },
        {
          $sort: { 'salesData.date': 1 }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('LftSales', LftSalesSchema)
