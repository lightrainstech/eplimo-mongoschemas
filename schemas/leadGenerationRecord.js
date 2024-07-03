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
    countryCode: {
      type: String
    },
    phone: {
      type: String,
      required: true
    },
    requestType: {
      type: String,
      default: 'lead',
      enum: ['lead', 'support']
    }
  },
  { timestamps: true }
)
LeadGenerationSchema.methods = {
  getSubmissions: async function (page) {
    try {
      const Leads = mongoose.model('LeadGeneration')
      let limit = 18
      page = page === 0 ? 0 : page - 1
      return await Leads.find({})
        .limit(limit)
        .skip(limit * page)
    } catch (error) {
      throw error
    }
  },
  getSubmission: async function (args) {
    try {
      const { email, requestType } = args
      const Leads = mongoose.model('LeadGeneration')
      return await Leads.findOne({ email, requestType })
    } catch (error) {
      console.log(error)
    }
  }
}

LeadGenerationSchema.index({
  email: 1,
  requestType: 1
})

module.exports = mongoose.model('LeadGeneration', LeadGenerationSchema)
