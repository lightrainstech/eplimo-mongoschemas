const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const WithdrawSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    balance: {
      type: String,
      required: true
    },
    txnId: {
      type: String,
      required: true
    },
    receivingWallet: {
      type: String,
      required: true
    },
    vault: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('WithdrawSchema', WithdrawSchema)
