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
    },
    txnHash: {
      type: String
    },
    status: {
      type: String,
      required: true,
      default: 'Initiated'
    }
  },
  { timestamps: true }
)

WithdrawSchema.methods = {
  updateStatus: async function (args) {
    const Withdraw = mongoose.model('WithdrawSchema')
    try {
      let { userId, amount, transactionId, txHash } = args
      const result = await Withdraw.findOneAndUpdate(
        { userId, txnId: transactionId },
        { $set: { amount, txnHash: txHash, status: 'Completed' } },
        { new: true }
      )
      return result
    } catch (err) {
      throw err
    }
  }
}

WithdrawSchema.index(
  {
    userId: 1
  },
  { txnId: 1 }
)

module.exports = mongoose.model('WithdrawSchema', WithdrawSchema)
