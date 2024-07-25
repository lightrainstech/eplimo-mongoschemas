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
    custodyWallet: {
      type: custodyWalletSchema
    },
    nonCustodyWallet: {
      type: [nonCustodyWalletSchema]
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lpoType: {
      type: String,
      enum: ['Organizations', 'Professionals', 'NA'],
      default: 'NA'
    },
    social: {
      twitter: socialSchema,
      linkedin: socialSchema,
      facebook: socialSchema
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
    description: {
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
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Partner', PartnerSchema)
