'use strict'

// External Dependancies
const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    paymentDetails: {
      type: Object,
      default: {}
    },
    transactionHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

PaymentSchema.methods = {
  addPayment: async function (data) {
    const Payment = mongoose.model('Payment')
    try {
      const buyer = data.merchantExtra.extra.buyerId,
        asset = data.merchantExtra.extra.nftId,
        paymentDetails = data,
        transactionHash = data.transaction
      let paymentModel = new Payment()
      paymentModel.buyer = buyer
      paymentModel.asset = asset
      paymentModel.paymentDetails = paymentDetails
      paymentModel.transactionHash = transactionHash
      return await paymentModel.save()
    } catch (err) {
      throw err
    }
  },
  getPaymentById: async function (paymentId, buyer) {
    const Payment = mongoose.model('Payment'),
      options = {
        criteria: { _id: paymentId, buyer: buyer }
      }
    return await Payment.load(options).populate('asset').lean().exec()
  },
  getPaymentByHash: async function (transactionHash) {
    const Payment = mongoose.model('Payment'),
      options = {
        criteria: { transactionHash }
      }
    return await Payment.load(options).populate('asset').lean().exec()
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
