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

module.exports = mongoose.model('LftSales', LftSalesSchema)
