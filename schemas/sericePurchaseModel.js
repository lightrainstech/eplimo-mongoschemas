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
            as: 'info'
          }
        },
        {
          $match: {
            'info.user': ObjectId(userId)
          }
        }
      ])
    } catch (e) {
      throw e
    }
  }
}

module.exports = mongoose.model('ServicePurchase', ServicePurchaseSchema)
