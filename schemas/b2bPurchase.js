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
          select: 'email referalCode'
        })
        .populate({
          path: 'nft',
          select: 'name price tokenId thumbnail'
        })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('B2BPurchase', B2BPurchaseSchema)
