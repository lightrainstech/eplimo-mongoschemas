const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema
const PartnerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true
    },
    companyType: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    hashedPassword: {
      type: String
    },
    salt: {
      type: String,
      default: ''
    },
    authToken: {
      type: String,
      default: ''
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String
    },
    countryCode: {
      type: String
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    services: {
      type: Array,
      default: [],
      required: true
    },
    specialities: {
      type: Array,
      default: []
    },
    isAdminVerified: {
      type: Boolean,
      default: false
    },
    isKycVerified: {
      type: Boolean,
      default: false
    },
    referalCode: {
      type: String,
      default: ''
    },
    affiliateCode: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    avatar: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    coverPic: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    images: {
      type: [
        {
          path: {
            type: String,
            default: ''
          },
          mimeType: {
            type: String,
            default: 'image/jpeg'
          }
        }
      ],
      default: []
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    kycStatus: {
      type: String,
      default: null
    },
    kycReferenceId: {
      type: String,
      default: null
    },
    tagLine: {
      type: String,
      default: null
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

PartnerSchema.methods = {
  getPartners: async function (args) {
    try {
      const { cType } = args
      let criteria = {}
      if (cType) {
        criteria.companyType = cType
      }
      const Partner = mongoose.model('Partner')
      return await Partner.find(criteria, {
        hashedPassword: 0,
        salt: 0,
        authToken: 0
      })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('Partner', PartnerSchema)
