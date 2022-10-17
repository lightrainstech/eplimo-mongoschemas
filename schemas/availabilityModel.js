const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AvailabilitySchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    isAvailable: {
      type: Boolean,
      default: false
    },
    sunday: {
      type: Boolean,
      default: false
    },
    monday: {
      type: Boolean,
      default: false
    },
    tuesday: {
      type: Boolean,
      default: false
    },
    wednesday: {
      type: Boolean,
      default: false
    },
    thursday: {
      type: Boolean,
      default: false
    },
    friday: {
      type: Boolean,
      default: false
    },
    saturday: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

AvailabilitySchema.methods = {
  getAvailability: async user => {
    const Availability = mongoose.model('Availability')
    return await Availability.find({ user }).limit(1)
  }
}

AvailabilitySchema.index({ user: 1 })

module.exports = mongoose.model('Availability', AvailabilitySchema)
