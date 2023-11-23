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
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('TokenPurchase', TokenPurchaseSchema)
