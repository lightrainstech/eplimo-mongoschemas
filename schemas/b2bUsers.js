const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const B2BSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    b2b: {
      type: Schema.ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

B2BSchema.methods = {}

module.exports = mongoose.model('B2B', B2BSchema)
