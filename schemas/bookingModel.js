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
    noteU: {
      type: String
    },
    noteP: {
      type: String
    },
    confirmedSlot: {
      type: String,
      enum: ['slotA', 'slotB', 'NA'],
      default: 'NA'
    },
    phone: {
      type: String
    },
    countryCode: {
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
  },
  getReservations: async (practitioner, status) => {
    const Booking = mongoose.model('Booking')
    return await Booking.find({ practitioner, status: status })
  },
  updateReservationStatus: async (bookingId, status) => {
    const Booking = mongoose.model('Booking')
    let stat = 'waiting'
    if (status) {
      stat = 'approved'
    } else {
      stat = 'declined'
    }
    return await Booking.findOneAndUpdate(
      { _id: bookingId, status: stat },
      { new: true }
    )
  }
}

BookingSchema.index({ user: 1 }, { user: 1, status: 1 })

module.exports = mongoose.model('Booking', BookingSchema)
