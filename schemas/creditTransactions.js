'use strict'

// External Dependancies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const CreditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    credit: { type: Number, required: true, default: 0 },
    serviceType: { type: String, required: true, enum: ['course', 'cashing'] },
    serviceId: {
      type: String,
      required: true,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('CreditTransaction', CreditTransactionSchema)
