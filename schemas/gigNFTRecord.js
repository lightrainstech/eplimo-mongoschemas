const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const GigNftSchema = new mongoose.Schema(
  {
    nft: {
      type: Schema.ObjectId,
      ref: 'Asset',
      required: true,
      unique: true
    },
    avail: {
      type: String,
      enum: ['stake', 'healtifi']
    },
    txnHash: {
      type: String
    }
  },
  { timestamps: true }
)

GigNftSchema.methods = {}

module.exports = mongoose.model('GigNft', GigNftSchema)
