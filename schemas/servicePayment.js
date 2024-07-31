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
    orderId: {
      type: String,
      default: null
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
    currency: { type: String, default: '' }
  },
  {
    timestamps: true
  }
)

ServicePaymentSchema.methods = {
  updatePaymentStatus: async function (args) {
    try {
      const { orderId, txnId, currency, data } = args
      const ServicePaymentModel = mongoose.model('ServicePayment')
      return await ServicePaymentModel.findOneAndUpdate(
        { orderId, status: 'pending' },
        {
          $set: {
            status: 'completed',
            currency: currency,
            transactionId: txnId,
            paymentDetails: data
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  }
}

ServicePaymentSchema.index(
  {
    unique: true,
    partialFilterExpression: { orderId: { $type: 'string' } }
  },
  {
    unique: true,
    partialFilterExpression: { transactionId: { $type: 'string' } }
  }
)
module.exports = mongoose.model('ServicePayment', ServicePaymentSchema)
