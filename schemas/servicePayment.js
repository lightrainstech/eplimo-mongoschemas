'use strict'

// External Dependancies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const ServicePaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentType: {
      type: String,
      enum: ['zoksh', 'futureverse'],
      required: true
    },
    transactionType: {
      type: String,
      enum: ['subscription', 'credits']
    },
    paymentDetails: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    transactionId: { type: String, default: '' },
    amount: { type: String, default: 0 },
    currency: { type: String, default: '' },
    receivedAmount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('ServicePayment', ServicePaymentSchema)
