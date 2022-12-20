'use strict'

// External Dependancies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentType: {
      type: String,
      enum: ['fireblocks', 'zoksh', 'limoPurchase', 'adminTransfer'],
      required: true
    },
    transactionType: {
      type: String,
      enum: [
        'activity',
        'referral',
        'buySneaker',
        'repairSneaker',
        'adminToUerBNBTransfer',
        'rewardWithdraw'
      ]
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
      paymentModel.paymentDetails = paymentDetails
      // saving payement details of zoksh
      if (paymentType === 'zoksh') {
        paymentModel.asset = transferReference
        paymentModel.paymentDetails = paymentDetails
        paymentModel.status = 'completed'
      }
      // saving payement details of fireblocks
      if (paymentType === 'fireblocks') {
        if (transactionType == 'activity') {
          paymentModel.activityDate = transferReference
        } else if (transactionType == 'referral') {
          paymentModel.referral = transferReference
        } else {
          paymentModel.asset = transferReference
        }
      }
      if (paymentType === 'limoPurchase') {
        paymentModel.asset = transferReference
        paymentModel.status = 'completed'
      }
      paymentModel.transactionType = transactionType
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
    const Payment = mongoose.model('Payment')
    const result = await Payment.findOneAndUpdate(
      { transactionId },
      { status: 'completed' },
      { new: true }
    )
    return result
  },
  getSneakerRepairHistory: async function (userId) {
    const Payment = mongoose.model('Payment'),
      options = {
        criteria: { transactionType: 'repairSneaker', user: userId }
      }
    return await Payment.list(options).populate('asset').lean().exec()
  },
  getPaymentData: async function (userId, nftId) {
    const Payment = mongoose.model('Payment')
    return await Payment.findOne({ user: userId, asset: nftId })
  },
  getSneakerRepairData: async function (nftId) {
    const Payment = mongoose.model('Payment'),
      options = {
        criteria: {
          transactionType: 'repairSneaker',
          asset: nftId,
          status: 'completed'
        },
        select: 'amount createdAt paymentType paymentDetails',
        sortRule: { createdAt: 1 }
      }
    return await Payment.list(options)
  },
  checkPurchases: async function (nfts, user, date) {
    const Payment = mongoose.model('Payment'),
      result = await Payment.find({
        asset: { $in: nfts },
        user: ObjectId(user),
        transactionType: 'buySneaker',
        status: 'completed',
        createdAt: { $gte: date }
      }).lean()

    return result
  },
  purchasesByDate: async function (startDate, endDate) {
    const Payment = mongoose.model('Payment')
    let options = {
      criteria: {
        transactionType: 'buySneaker',
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      },
      populate: [
        {
          path: 'asset',
          select: 'tokenId owner price efficiencyIndex category _id'
        },
        { path: 'user', select: 'email nonCustodyWallet custodyWallet' }
      ],
      sortRule: { createdAt: -1 }
    }
    return await Payment.list(options)
  }
}

PaymentSchema.statics = {
  load: function (options) {
    options.select = options.select || ''
    return this.findOne(options.criteria).select(options.select)
  },
  list: function (options) {
    const criteria = options.criteria || {}
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria).select(select).sort(sortRule).populate(populate)
  }
}

PaymentSchema.index(
  { user: 1 },
  { transactionId: 1 },
  { transactionType: 1, user: 1 },
  {
    user: 1,
    asset: 1
  },
  {
    transactionType: 1,
    asset: 1,
    status: 1
  },
  {
    asset: 1,
    transactionType: 1,
    status: 1,
    createdAt: 1
  }
)

module.exports = mongoose.model('Payment', PaymentSchema)
