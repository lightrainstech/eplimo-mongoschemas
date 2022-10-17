const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ServiceSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    service: {
      type: String
    },
    price: {
      type: String,
      default: '0'
    },
    onSale: {
      type: Boolean,
      default: false
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    image: {
      type: String
    },
    data: {
      type: String
    }
  },
  { timestamps: true }
)

ServiceSchema.methods = {
  getServices: async () => {
    const Service = mongoose.model('Service')
    return await Service.find({})
  },
  getServicesByuser: async () => {
    const Service = mongoose.model('Service')
    return await Service.find({ user })
  }
}

ServiceSchema.index({ user: 1 })

module.exports = mongoose.model('Service', ServiceSchema)
