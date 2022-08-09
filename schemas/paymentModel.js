'use strict'

// External Dependancies
const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema(
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
      enum: ['activity', 'referral', 'buySneaker', 'repairSneaker']
    },
    activityDate: {
      type: String
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'asset'
    },
    paymentDetails: {
      type: Object,
      default: {}
    },
    status: { type: String, enum: ['added', 'completed'], default: 'added' },
    transactionId: { type: String, default: '' },
    amount: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

PaymentSchema.methods = {
  addPayment: async function (
    user,
    paymentType,
    transactionType,
    transferReference,
    transactionId,
    amount,
    paymentDetails
  ) {
    try {
      let Payment = mongoose.model('Payment'),
        paymentModel = new Payment()
      paymentModel.user = user
      paymentModel.paymentType = paymentType
      // saving payement details of zoksh
      if (paymentType === 'zoksh') {
        paymentModel.asset = transferReference
        paymentModel.transactionType = transactionType
        paymentModel.paymentDetails = paymentDetails
        paymentModel.status = 'completed'
      }
      // saving payement details of fireblocks
      if (paymentType === 'fireblocks') {
        paymentModel.transactionType = transactionType
        if (transactionType == 'activity') {
          paymentModel.activity = transferReference
        }
        if (transactionType == 'referral') {
          paymentModel.referral = transferReference
        }
      }
      paymentModel.transactionId = transactionId
      paymentModel.amount = amount
      return await paymentModel.save()
    } catch (err) {
      throw err
    }
  },
  getPaymentById: async function (paymentId, user) {
    const Payment = mongoose.model('Payment'),
      options = {
        criteria: { _id: paymentId, user: user }
      }
    return await Payment.load(options).populate('asset').lean().exec()
  },
  updateTransaction: async function (transactionId) {
    const Transaction = mongoose.model('Transaction')
    const result = await Transaction.findOneAndUpdate(
      { transactionId },
      { status: 'completed' },
      { new: true }
    )
    return result
  }
}

PaymentSchema.statics = {
  load: function (options) {
    options.select = options.select || ''
    return this.findOne(options.criteria).select(options.select)
  }
}

PaymentSchema.index({ user: 1 })

module.exports = mongoose.model('Payment', PaymentSchema)
