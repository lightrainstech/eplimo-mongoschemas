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
      unique: true,
      required: false
    }
  },
  { timestamps: true }
)

NftPurchaseSchema.methods = {}

module.exports = mongoose.model('NftPurchase', NftPurchaseSchema)
