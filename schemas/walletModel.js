const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    },
    primaryWallet: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('WalletSchema', WalletSchema)
