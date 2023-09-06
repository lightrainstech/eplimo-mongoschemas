const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const NftPurchaseSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
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
      required: false
    }
  },
  { timestamps: true }
)

NftPurchaseSchema.methods = {
  getPurchaseOfTheWeek: async function (startDate, endDate) {
    try {
      console.log(new Date(startDate))
      console.log(new Date(endDate))
      const NftPurchase = mongoose.model('NftPurchase')
      return NftPurchase.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: 'nft',
            foreignField: '_id',
            as: 'nft_details'
          }
        },
        {
          $unwind: '$nft_details'
        },
        {
          $addFields: {
            priceNumeric: { $toDouble: '$nft_details.price' }
          }
        },
        {
          $lookup: {
            from: 'users', // Name of the user collection
            localField: 'referralCode', // Field in the purchase collection referencing the user's referralCode
            foreignField: 'referalCode', // Field in the user collection
            as: 'user_details' // Alias for the joined data
          }
        },
        {
          $unwind: '$user_details'
        },
        {
          $group: {
            _id: '$referralCode',
            total_purchase_price: { $sum: '$priceNumeric' },
            purchases: { $push: '$$ROOT' }, // Push the original purchase documents into an array
            user_details: { $first: '$user_details' }
          }
        },
        {
          $project: {
            _id: 0,
            referralCode: '$_id',
            total_purchase_price: 1,
            purchases: 1,
            user_details: { email1: 1, _id: 1, custodyWallet: 1 }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

NftPurchaseSchema.index(
  {
    referralCode: 1
  },
  { user: 1 }
)
module.exports = mongoose.model('NftPurchase', NftPurchaseSchema)
