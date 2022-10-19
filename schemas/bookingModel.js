const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    practitioner: { type: Schema.ObjectId, ref: 'User', required: true },
    slotA: {
      type: String,
      required: true
    },
    slotB: {
      type: String
    },
    status: {
      type: String,
      enum: ['waiting', 'approved', 'declined'],
      default: 'waiting'
    },
    data: {
      type: String
    },
    confirmedSlot: {
      type: String,
      enum: ['slotA', 'slotB','NA'],
      default: 'NA'
    }
  },
  { timestamps: true }
)

BookingSchema.methods = {
  getBookingHistory: async user => {
    const Booking = mongoose.model('Booking')
    return await Booking.find({ user }).limit(1)
  },
  getHistoryByStatus: async (user, status) => {
    const Booking = mongoose.model('Booking')
    return await Booking.find({ user, status: status })
  }
}

BookingSchema.index({ user: 1 }, { user: 1, status: 1 })

module.exports = mongoose.model('Booking', BookingSchema)
