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
  }
})

LftSalesSchema.methods = {
  fetchSalesList: async function (args) {
    try {
      const { startDate, endDate } = args
      const LftSalesModel = mongoose.model('LftSales')
      return await LftSalesModel.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('LftSales', LftSalesSchema)
