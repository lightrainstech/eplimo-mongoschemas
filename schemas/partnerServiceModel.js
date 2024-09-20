const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ObjectId } = mongoose.Types

const PartnerServiceSchema = new mongoose.Schema(
  {
    partner: { type: Schema.ObjectId, ref: 'Partner', required: true },
    serviceName: {
      type: String
    },
    serviceType: {
      type: String
    },
    images: [
      {
        path: {
          type: String
        },
        mimeType: {
          type: String
        }
      }
    ],
    serviceDescription: {
      type: String
    },
    inclusions: {
      type: Array,
      default: []
    },
    terms: {
      type: String
    },
    review: [
      {
        user: { type: Schema.ObjectId, ref: 'User', required: true },
        message: { type: String, default: '' },
        rating: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 }
      }
    ],
    offersList: {
      type: Array,
      default: []
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

PartnerServiceSchema.methods = {
  getServicesByPartner: async function (args) {
    try {
      let { partner } = args
      const PartnerService = mongoose.model('PartnerService')
      return await PartnerService.find({ partner: ObjectId(partner) }).populate(
        {
          path: 'partner',
          select: 'companyName companyType email phone category location'
        }
      )
    } catch (error) {
      throw error
    }
  },
  updateService: async function (args) {
    try {
      const { serviceId, cleanObj } = args
      const PartnerService = mongoose.model('PartnerService')
      return PartnerService.findOneAndUpdate(
        { _id: Object(serviceId) },
        { $set: cleanObj },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  getServiceDetail: async function (args) {
    try {
      const { serviceId } = args
      const PartnerService = mongoose.model('PartnerService')
      return PartnerService.findOne({ _id: ObjectId(serviceId) })
    } catch (error) {
      throw error
    }
  }
}
PartnerServiceSchema.index({ partner: 1 })

module.exports = mongoose.model('PartnerService', PartnerServiceSchema)
