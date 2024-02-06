'use strict'

// External Dependancies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const SubscriptionPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentType: {
      type: String,
      enum: ['fireblocks', 'zoksh'],
      required: true
    },
    transactionType: {
      type: String,
      enum: ['subscription']
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
    amount: { type: String, required: true },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    }
  },
  {
    timestamps: true
  }
)

SubscriptionPaymentSchema.methods = {
  addPayment: async function (
    user,
    paymentType,
    transactionType,
    planId,
    transactionId,
    amount,
    paymentDetails
  ) {
    try {
      console.log(paymentType, transactionType)
      let Payment = mongoose.model('SubscriptionPayment'),
        paymentModel = new Payment()
      paymentModel.user = user
      paymentModel.paymentType = paymentType
      paymentModel.paymentDetails = paymentDetails
      // saving payement details of zoksh
      if (paymentType === 'zoksh') {
        paymentModel.asset = planId
        paymentModel.paymentDetails = paymentDetails
        paymentModel.status = 'completed'
      }
      paymentModel.transactionType = transactionType
      paymentModel.transactionId = transactionId
      paymentModel.amount = amount
      return await paymentModel.save()
    } catch (err) {
      throw err
    }
  }
}
module.exports = mongoose.model(
  'SubscriptionPayment',
  SubscriptionPaymentSchema
)
