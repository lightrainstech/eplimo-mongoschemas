const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    },
    review: [
      {
        user: { type: Schema.ObjectId, ref: 'User', required: true },
        message: { type: String, default: '' },
        rating: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 }
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('PartnerService', PartnerServiceSchema)
