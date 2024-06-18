const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const LftPurchaseOrderSchema = new mongoose.Schema(
  {
    wallet: {
      type: String
    },
    referralCode: {
      type: String
    },
    orderId: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      default: 'pending'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('LftPurchaseOrder', LftPurchaseOrderSchema)
