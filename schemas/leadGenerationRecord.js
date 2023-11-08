const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const Schema = mongoose.Schema

const LeadGenerationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)
LeadGenerationSchema.methods = {
  getSubmission: async function (page) {
    try {
      const Leads = mongoose.model('LeadGeneration')
      let limit = 18
      page = page === 0 ? 0 : options.page - 1
      return await Leads.find({})
        .limit(limit)
        .skip(limit * page)
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('LeadGeneration', LeadGenerationSchema)
