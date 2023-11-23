const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const TokenPurchaseSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    paymentDetails: {
      type: Object,
      default: {}
    },
    txnHash: {
      type: String,
      required: false,
      unique: true
    },
    amount: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['added', 'completed'],
      default: 'added'
    },
    isWalletConnected: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      enum: ['LIMO'],
      default: 'LIMO'
    },
    tokenAmount: {
      type: String
    },
    isStaked: {
      type: Boolean,
      default: false
    },
    wallet: {
      type: String
    },
    limoInUSD: {
      type: String
    },
    stakePeriod: {
      type: Number,
      enum: [1, 2, 3]
    }
  },
  { timestamps: true }
)

TokenPurchaseSchema.methods = {
  addPurchase: async function (args) {
    try {
      let {
        stakeWallet,
        amount,
        stakePeriod,
        email,
        data,
        limoInUsd,
        tokenAmount,
        isWalletConnected
      } = args
      const tokenPurchase = mongoose.model('TokenPurchase')
      tokenPurchaseModel = new tokenPurchase()
      tokenPurchaseModel.email = email
      tokenPurchaseModel.wallet = stakeWallet
      tokenPurchaseModel.amount = amount
      tokenPurchaseModel.paymentDetails = data
      tokenPurchaseModel.stakePeriod = stakePeriod
      tokenPurchaseModel.limoInUSD = limoInUsd
      tokenPurchaseModel.tokenAmount = tokenAmount
      tokenPurchaseModel.txnHash = data.transaction
      tokenPurchaseModel.isWalletConnected = isWalletConnected
      return await tokenPurchaseModel.save()
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('TokenPurchase', TokenPurchaseSchema)
