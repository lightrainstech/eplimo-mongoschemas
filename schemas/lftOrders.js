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
    items: {
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
      type: Array,
      default: []
    },
    latestAssetId: {
      type: Number
    },
    assetCounter: {
      type: Number,
      default: 1
    },
    transferred: {
      type: Boolean,
      default: false
    },
    assetTxnHash: {
      type: String,
      default: null
    },
    referralCode: {
      type: String,
      default: null
    },
    email: {
      type: String
    },
    txnData: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
)

LftPurchaseOrderSchema.methods = {
  updateStatus: async function (args) {
    try {
      const { orderId, hash, assetId, latestAssetId, assetCounter } = args
      const LftPurchaseOrderModel = mongoose.model('LftPurchaseOrder')
      return await LftPurchaseOrderModel.findOneAndUpdate(
        { orderId, paymentStatus: 'pending' },
        {
          $set: {
            paymentTxnHash: hash,
            assetId: assetId,
            paymentStatus: 'completed',
            latestAssetId: latestAssetId,
            assetCounter: assetCounter
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
      }).sort({ updatedAt: -1, latestAssetId: 1 })
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
  },
  referralSales: async function () {
    try {
      const lftPurchaseModel = mongoose.model('LftPurchaseOrder')
      return await lftPurchaseModel.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            $and: [
              {
                referralCode: {
                  $exists: true
                }
              },
              {
                $expr: {
                  $ne: ['$referralCode', '']
                }
              }
            ]
          }
        },
        {
          $addFields: {
            items: { $ifNull: ['$items', 1] }
          }
        },
        {
          $group: {
            _id: '$referralCode',
            totalLft: {
              $sum: '$items'
            }
          }
        },
        {
          $sort: {
            totalLft: -1
          }
        }
      ])
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
  },
  { wallet: 1, paymentStatus: 1 },
  { paymentStatus: 1 }
)

module.exports = mongoose.model('LftPurchaseOrder', LftPurchaseOrderSchema)
