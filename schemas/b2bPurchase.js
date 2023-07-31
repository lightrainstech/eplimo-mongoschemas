const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const B2BPurchaseSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    b2b: {
      type: Schema.ObjectId,
      ref: 'Corporate',
      required: true
    },
    referalCode: {
      type: String,
      required: true
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

B2BPurchaseSchema.methods = {}

module.exports = mongoose.model('B2BPurchase', B2BPurchaseSchema)
