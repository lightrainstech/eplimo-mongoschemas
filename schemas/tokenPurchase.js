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
      type: Number
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
    },
    stakeWallet: {
      type: String
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
      tokenPurchaseModel.stakeWallet = stakeWallet
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
        { _id: recordId, paymentStatus: 'added' },
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
      let { recordId, txnhash, stakeWallet } = args
      const tokenPurchase = mongoose.model('TokenPurchase')
      return await tokenPurchase.findOneAndUpdate(
        { _id: recordId },
        {
          $set: {
            stakeHash: txnhash,
            isStaked: true,
            stakeWallet: stakeWallet
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  getStakesByWallet: async function (wallet) {
    try {
      const tokenPurchase = mongoose.model('TokenPurchase')
      return await tokenPurchase.aggregate([
        {
          $match: {
            stakeWallet: wallet,
            isStaked: true
          }
        },
        {
          $group: {
            _id: null,
            totalStakes: { $sum: '$tokenAmount' },
            firstEntry: { $first: '$$ROOT' }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  checkStakeAgainstPayment: async function (args) {
    try {
      const tokenPurchase = mongoose.model('TokenPurchase')
      let { paymentHash } = args
      return await tokenPurchase.findOne({
        txnHash: paymentHash,
        isStaked: true,
        stakeHash: { $ne: null }
      })
    } catch (error) {
      throw error
    }
  }
}

TokenPurchaseSchema.index(
  { _id: 1, paymentStatus: 1 },
  {
    stakeWallet: 1
  },
  {
    txnHash: 1,
    isStaked: 1,
    stakeHash: 1
  }
)

module.exports = mongoose.model('TokenPurchase', TokenPurchaseSchema)
