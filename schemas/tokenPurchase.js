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
      unique: true,
      sparse: true
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
    },
    stakeHash: {
      type: String,
      unique: true,
      sparse: true
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
        limoInUsd,
        tokenAmount,
        isWalletConnected
      } = args
      const tokenPurchase = mongoose.model('TokenPurchase')
      tokenPurchaseModel = new tokenPurchase()
      tokenPurchaseModel.email = email
      tokenPurchaseModel.wallet = stakeWallet
      tokenPurchaseModel.amount = amount
      tokenPurchaseModel.stakePeriod = stakePeriod
      tokenPurchaseModel.limoInUSD = limoInUsd
      tokenPurchaseModel.tokenAmount = tokenAmount
      tokenPurchaseModel.isWalletConnected = isWalletConnected
      return await tokenPurchaseModel.save()
    } catch (error) {
      throw error
    }
  },
  updatePaymentHash: async function (args) {
    try {
      let { recordId, txnHash, data } = args
      const tokenPurchase = mongoose.model('TokenPurchase')
      return await tokenPurchase.findOneAndUpdate(
        { _id: recordId },
        {
          $set: {
            txnHash: txnHash,
            paymentStatus: 'completed',
            paymentDetails: data
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },

  updateStakeDetails: async function (args) {
    try {
      let { recordId, txnhash } = args
      const tokenPurchase = mongoose.model('TokenPurchase')
      return await tokenPurchase.findOneAndUpdate(
        { _id: recordId },
        {
          $set: {
            stakeHash: txnhash,
            isStaked: true
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('TokenPurchase', TokenPurchaseSchema)
