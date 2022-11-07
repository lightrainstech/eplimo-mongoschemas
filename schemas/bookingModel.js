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
  getReservations: async (practitioner, status, page) => {
    const Booking = mongoose.model('Booking')
    let options = {
      criteria: {
        practitioner: practitioner,
        status: status
      },
      page: Number(page),
      populate: {
        path: 'user',
        select: 'userName name email'
      }
    }
    return await Booking.listForPagination(options)
  },
  updateReservationStatus: async data => {
    let { userId, bookingId, status, note, slot } = data
    const Booking = mongoose.model('Booking')
    let stat = 'waiting'
    if (status) {
      stat = status
    } else {
      stat = 'declined'
    }
    return await Booking.findOneAndUpdate(
      { _id: bookingId, practitioner: userId },
      { $set: { status: stat, noteP: note, confirmedSlot: slot } },
      { new: true }
    )
  },
  getBookingList: async (user, status, page) => {
    const Booking = mongoose.model('Booking')
    let options = {
      criteria: {
        user: user,
        status: status
      },
      page: Number(page)
    }
    return await Booking.listForPagination(options)
  },
  getBookingDetails: async (uId, bookingId) => {
    const Booking = mongoose.model('Booking')
    return await Booking.find({
      _id: bookingId,
      $or: [{ user: uId }, { practitioner: uId }]
    })
  }
}

BookingSchema.statics = {
  listForPagination: function (options) {
    const criteria = options.criteria || {}
    const page = options.page === 0 ? 0 : options.page - 1
    const limit = parseInt(options.limit) || 18
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria)
      .select(select)
      .sort(sortRule)
      .limit(limit)
      .skip(limit * page)
      .populate(populate)
      .lean()
      .exec()
  }
}
BookingSchema.index(
  { user: 1 },
  { user: 1, status: 1 },
  { user: 1, practitioner: 1 }
)

module.exports = mongoose.model('Booking', BookingSchema)
