const mongoose = require('mongoose')

const ReservationSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    isAvailable: {
      type: Boolean,
      default: false
    },
    availableDays: {
      type: String,
      required: true,
      enum: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      default: '-NA-'
    }
  },
  { timestamps: true }
)

ReservationSchema.methods = {
  getAvailability: async user => {
    const Reservation = mongoose.model('Reservation')
    return await Reservation.find({ user }).limit(1)
  }
}

ReservationSchema.index({ user: 1 })

module.exports = mongoose.model('Reservation', ReservationSchema)
