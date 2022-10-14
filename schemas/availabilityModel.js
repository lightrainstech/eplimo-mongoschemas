const mongoose = require('mongoose')

const AvailabilitySchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    // isAvailable: {
    //   type: Boolean,
    //   default: false
    // }
    availableDays: [
      {
        day: {
          type: String,
          enum: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ]
        },
        isAvailable: {
          type: Boolean,
          default: false
        }
      }
    ]
    // availableDays: {
    //   type: String,
    //   enum: [
    //     'Sunday',
    //     'Monday',
    //     'Tuesday',
    //     'Wednesday',
    //     'Thursday',
    //     'Friday',
    //     'Saturday'
    //   ],
    //   required: true,
    //   default: ['-NA-']
    // }
  },
  { timestamps: true }
)

AvailabilitySchema.methods = {
  getAvailability: async user => {
    const Reservation = mongoose.model('Reservation')
    return await Reservation.find({ user }).limit(1)
  }
}

AvailabilitySchema.index({ user: 1 })

module.exports = mongoose.model('Availability', AvailabilitySchema)
