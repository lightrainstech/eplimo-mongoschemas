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
    },
    assetId: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
)

LftPurchaseOrderSchema.index(
  { assetId: 1 },
  {
    unique: true,
    partialFilterExpression: { assetId: { $type: 'number' } }
  }
)

module.exports = mongoose.model('LftPurchaseOrder', LftPurchaseOrderSchema)
