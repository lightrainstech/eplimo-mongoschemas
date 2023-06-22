const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const TestimonialSchema = new mongoose.Schema(
  {
    testimonials: {
      type: String,
      required: true
    },
    user: { type: ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Testimonial', TestimonialSchema)
