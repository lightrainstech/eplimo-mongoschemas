const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const B2BPurchaseSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    b2b: {
      type: Schema.ObjectId,
      ref: 'Corporate',
      required: true
    },
    referralCode: {
      type: String
    },
    nft: {
      type: Schema.ObjectId,
      ref: 'Asset',
      required: true
    },
    txnHash: {
      type: String,
      unique: true,
      required: true
    }
  },
  { timestamps: true }
)

B2BPurchaseSchema.methods = {
  getSalesByReferral: async referralCode => {
    try {
      const B2BPurchase = mongoose.model('B2BPurchase')
      return await B2BPurchase.find({ referralCode: referralCode })
        .populate({
          path: 'user',
          select: 'email referalCode name userName'
        })
        .populate({
          path: 'nft',
          select: 'name price tokenId thumbnail'
        })
    } catch (error) {
      throw error
    }
  },
  getTotalSale: async corpId => {
    try {
      const B2BPurchase = mongoose.model('B2BPurchase')
      return await B2BPurchase.aggregate([
        {
          $match: {
            b2b: ObjectId(corpId)
          }
        },
        {
          $lookup: {
            from: 'assets', // Name of the referenced collection
            localField: 'nft',
            foreignField: '_id',
            as: 'assetDetails'
          }
        },
        {
          $unwind: '$assetDetails'
        },
        {
          $addFields: {
            priceAsDouble: { $toDouble: '$assetDetails.price' }
          }
        },
        {
          $group: {
            _id: '$_id',
            totalPurchase: { $sum: '$priceAsDouble' }
          }
        },
        {
          $project: {
            _id: 0, // Exclude _id field from the result
            totalPurchase: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

B2BPurchaseSchema.index({ b2b: 1 })

module.exports = mongoose.model('B2BPurchase', B2BPurchaseSchema)
