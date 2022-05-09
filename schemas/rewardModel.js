const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const RewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '---'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    distributorId: {
      type: String,
      default: '---'
    },
    phone: {
      type: String,
      default: '---'
    },
    totalPoint: {
      type: Number,
      default: 0
    },
    limoR: {
      type: Number,
      default: 0
    },
    limoT: { type: Number, default: 0 }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reward', RewardSchema)
