const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const LftPurchaseOrderSchema = new mongoose.Schema(
  {
    wallet: {
      type: String
    },
    amount: {
      type: Number
    },
    referralCode: {
      type: String
    },
    orderId: {
      type: String,
      unique: true
    },
    paymentTxnHash: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      default: 'pending'
    },
    assetId: {
      type: Number,
      default: null
    },
    transferred: {
      type: Boolean,
      default: false
    },
    assetTxnHash: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

LftPurchaseOrderSchema.methods = {
  updateStatus: async function (args) {
    try {
      const { orderId, hash, assetId } = args
      const LftPurchaseOrderModel = mongoose.model('LftPurchaseOrder')
      return await LftPurchaseOrderModel.findOneAndUpdate(
        { orderId, paymentStatus: 'pending' },
        {
          $set: {
            paymentTxnHash: hash,
            assetId: assetId,
            paymentStatus: 'completed'
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  fetchLatestAsset: async function () {
    try {
      const LftPurchaseOrderModel = mongoose.model('LftPurchaseOrder')
      return await LftPurchaseOrderModel.findOne({
        paymentStatus: 'completed'
      }).sort({ assetId: 1 })
    } catch (error) {
      throw error
    }
  },
  getAssetByWallet: async function (wallet) {
    try {
      const LftPurchaseOrderModel = mongoose.model('LftPurchaseOrder')
      return await LftPurchaseOrderModel.find({
        wallet,
        paymentStatus: 'completed'
      })
    } catch (error) {
      throw error
    }
  },
  totalSoldAsset: async function () {
    try {
      const LftPurchaseOrderModel = mongoose.model('LftPurchaseOrder')
      return await LftPurchaseOrderModel.find({
        paymentStatus: 'completed'
      }).countDocuments()
    } catch (error) {
      throw error
    }
  }
}

LftPurchaseOrderSchema.index(
  { assetId: 1 },
  {
    unique: true,
    partialFilterExpression: { assetId: { $type: 'number' } }
  },
  { assetTxnHash: 1 },
  {
    unique: true,
    partialFilterExpression: { assetTxnHash: { $type: 'string' } }
  },
  { paymentTxnHash: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentTxnHash: { $type: 'string' } }
  }
)

module.exports = mongoose.model('LftPurchaseOrder', LftPurchaseOrderSchema)
