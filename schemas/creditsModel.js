'use strict'

// External Dependancies
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const CreditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    credit: { type: Number, required: true, default: 0 }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Credit', CreditSchema)
