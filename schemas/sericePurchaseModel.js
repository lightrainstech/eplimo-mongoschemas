const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ServicePurchaseSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    service: {
      type: Schema.ObjectId,
      ref: 'Service',
      required: true
    },
    limo: {
      type: String,
      default: '0'
    },
    limoR: {
      type: String,
      default: '0'
    },
    txnId: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ServicePurchase', ServicePurchaseSchema)
