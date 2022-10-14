const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [''],
    default: 'NA'
  },
  date: {
    type: String
  },
  time: {
    type: String
  }
})
const BookingSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    practitioner: { type: Schema.ObjectId, ref: 'User', required: true },
    slotA: slotSchema,
    slotB: slotSchema,
    status: {
      type: String,
      enum: ['waiting', 'approved', 'declined'],
      default: 'waiting'
    },
    data: {
      type: String
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
