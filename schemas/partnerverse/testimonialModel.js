const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const TestimonialSchema = new mongoose.Schema(
  {
    testimonials: {
      type: String,
      required: true
    },
    user: { type: ObjectId, ref: 'User' },
    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

TestimonialSchema.methods = {
  getAllTestimonials: async function () {
    try {
      const TestimonialModel = mongoose.model('Testimonial')
      let data = await TestimonialModel.find({})
      return data
    } catch (error) {
      throw error
    }
  }
}
module.exports = mongoose.model('Testimonial', TestimonialSchema)
