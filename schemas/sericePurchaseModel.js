const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ObjectId } = mongoose.Types

const ServicePurchaseSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    service: {
      type: Schema.ObjectId,
      ref: 'Service',
      required: true
    },
    limo: {
      type: String,
      default: '0'
    },
    txnId: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
)

ServicePurchaseSchema.methods = {
  getAllSales: async function (userId) {
    try {
      let ServicePurchaseModel = mongoose.model('ServicePurchase')
      return await ServicePurchaseModel.aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'packageInfo'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'buyer'
          }
        },
        {
          $match: {
            'packageInfo.user': ObjectId(userId)
          }
        },
        { $unwind: '$packageInfo' },
        { $unwind: '$buyer' },
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $project: {
            _id: 1,
            packageInfo: {
              _id: 1,
              image: 1,
              priceInUSD: 1,
              onSale: 1,
              isPromoted: 1,
              service: 1,
              description: 1
            },
            buyer: {
              _id: 1,
              userName: 1,
              name: 1,
              email: 1,
              countryCode: 1,
              phone: 1,
              avatar: 1
            }
          }
        }
      ])
    } catch (e) {
      throw e
    }
  },
  getAllPurchases: async function (userId) {
    try {
      let ServicePurchaseModel = mongoose.model('ServicePurchase')
      return await ServicePurchaseModel.find({ user: ObjectId(userId) })
        .populate({ path: 'service' })
        .sort({ createdAt: 1 })
    } catch (e) {
      throw e
    }
  }
}

ServicePurchaseSchema.index({ user: 1 })

module.exports = mongoose.model('ServicePurchase', ServicePurchaseSchema)
