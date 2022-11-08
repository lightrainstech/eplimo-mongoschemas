const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId
const crypto = require('crypto')
const { v5 } = require('uuid')

const socialSchema = {
  url: String
}

const nonCustodyWalletSchema = {
  _id: false,
  wallet: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}

const custodyWalletSchema = {
  _id: false,
  vault: {
    type: String
  },
  wallet: {
    type: String
  }
}

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['lpo', 'user'],
      default: 'user'
    },
    userName: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String
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
    lpoCategory: {
      type: String,
      enum: [
        'Ayurveda Centre',
        'Fitness Center',
        'Health Food',
        'Health tech products',
        'Hospitals/Clinics',
        'Other',
        'Training Company',
        'Wellness Centre',
        'Wellness Resort',
        'Yoga Studio',
        'Certified Lifestyle Coach',
        'Dietitian/ Nutritionist',
        'Fitness Trainer',
        'Healer',
        'Health/ Wellness Coach',
        'Life Coach/ Motivational Speaker',
        'Medical Doctor',
        'Meditation Guru',
        'Naturopath',
        'Physiotherapist',
        'Psychologist',
        'Yoga expert',
        'NA'
      ],
      default: 'NA'
    },
    lpoSpecialization: {
      type: String,
      enum: [
        'Gym',
        'Health Clubs',
        'PhysioTherapy',
        'Pilates',
        'Zumba',
        'General wellness',
        'Spa',
        'Speciality',
        'Clinics',
        'Panchakarma',
        'Massage Centre',
        'Meditation',
        'Yoga therapy',
        'Ayurveda',
        'Chinese',
        'Functional Medicine',
        'Homeo',
        'Integrative Medicine',
        'Lifestyle medicine',
        'Naturopathy',
        'Siddha',
        'Sowarigpa',
        'Super Speciality',
        'Unani',
        'Fitness',
        'Health Coaches',
        'Nutrition',
        'Yoga',
        'General',
        'Training and Development',
        'Wellness Related',
        'Other',
        'NA'
      ],
      default: 'NA'
    },
    social: {
      twitter: socialSchema,
      linkedin: socialSchema,
      facebook: socialSchema
    },
    isPractitioner: {
      type: Boolean,
      default: false
    },
    practitionerCategory: {
      type: String,
      enum: [
        'All',
        'Allopathy',
        'Ayurveda',
        'Chinese medicine',
        'Diet/Nutrition',
        'Homeopathy',
        'Fitness',
        'Life coaching',
        'Meditation',
        'Naturopathy',
        'Psychology',
        'Yoga',
        'Zumba',
        'NA'
      ],
      default: 'NA'
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
    isInstitution: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    isMetaverse: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

UserSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

UserSchema.methods = {
  makeSalt: function () {
    // return Math.round(new Date().valueOf() * Math.random()) + "";
    return crypto.randomBytes(64).toString('hex')
  },

  authenticate: function (plainText) {
    if (this.encryptPassword(plainText) === this.hashedPassword) {
      return { auth: true, data: this }
    } else {
      return { auth: false, data: this }
    }
  },

  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha256', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  },

  getByEmail: async function (email) {
    const User = mongoose.model('User')
    let data = await User.findOne({ email: email })
    if (data) {
      return true
    } else {
      return false
    }
  },
  getById: async function (id) {
    const User = mongoose.model('User')
    return await User.findOne(
      { _id: id },
      {
        email: 1,
        userName: 1,
        salt: 1,
        hashedPassword: 1,
        isActive: 1,
        nonCustodyWallet: 1,
        custodyWallet: 1
      }
    ).exec()
  },

  generateRefreshToken: function (str) {
    return v5(str, process.env.UUID_NAMESPACE)
  },
  authUserNameOrEmail: async function (creds) {
    const User = mongoose.model('User')
    let query = {
      $or: [{ email: creds }, { userName: creds }]
    }
    let result = await User.find(query).limit(1).exec()
    return result.length > 0 ? result[0] : null
  },
  setAuthToken: async function (email, authToken) {
    const User = mongoose.model('User')
    return await User.findOneAndUpdate(
      { email: email },
      { $set: { authToken: authToken } },
      { new: true }
    )
  },
  getUserByEmail: async function (email) {
    const User = mongoose.model('User'),
      options = {
        criteria: { email: email },
        select: 'email, custodyWallet'
      }
    return await User.load(options)
  },
  getUserById: async function (id) {
    const User = mongoose.model('User'),
      result = await User.findOne({ _id: id }).lean().exec()
    return result
  },
  updateProfile: async function (userId, update) {
    const User = mongoose.model('User'),
      data = await User.findOneAndUpdate(
        { _id: userId },
        { $set: update },
        { new: true }
      )
    return data
  },
  getUserByUserName: async function (userName) {
    const User = mongoose.model('User'),
      options = {
        criteria: { userName: userName }
      }
    return await User.load(options)
  },
  verifyEmail: async function (userId, otp) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: userId, authToken: otp },
        { authToken: null, isEmailVerified: true },
        { new: true }
      )
    return result
  },
  setAuthTokenForEmailVerify: async function (email, authToken) {
    const User = mongoose.model('User')
    return await User.findOneAndUpdate(
      { email: email, isEmailVerified: false },
      { $set: { authToken: authToken } },
      { new: true }
    )
  },
  updateExistingWallet: async function (wallet, userId) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        {
          _id: userId,
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet, isVerified: false }
          }
        },
        { $set: { 'nonCustodyWallet.$.isVerified': true } },
        { new: true }
      )
    return result
  },
  checkIfWalletExists: async function (wallet) {
    const User = mongoose.model('User'),
      options = {
        criteria: {
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet, isVerified: true }
          }
        }
      }
    return await User.load(options)
  },
  updateWallet: async function (wallet, userId) {
    const User = mongoose.model('User'),
      nonCustodyWallet = { wallet, isVerified: true },
      result = await User.findOneAndUpdate(
        {
          _id: ObjectId(userId)
        },
        { $addToSet: { nonCustodyWallet } },
        { new: true }
      )
    return result
  },
  updateCustodyWallet: async function (userId, vault, wallet) {
    const User = mongoose.model('User'),
      custodyWallet = { vault, wallet },
      result = await User.findOneAndUpdate(
        { _id: userId },
        { custodyWallet },
        { new: true }
      )
    return result
  },
  getByIdWithLimorStake: async function (userId) {
    const User = mongoose.model('User')
    let data = await User.aggregate([
      { $match: { _id: ObjectId(userId) } },
      {
        $lookup: {
          from: 'stakingrewards',
          let: { userId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$userId', '$$userId'] } } }],
          as: 'limorstakes'
        }
      },
      {
        $project: {
          email: 1,
          userName: 1,
          salt: 1,
          hashedPassword: 1,
          isActive: 1,
          nonCustodyWallet: 1,
          custodyWallet: 1,
          limorstakes: {
            stakeAmount: 1,
            isApproved: 1,
            isProcesses: 1,
            createdAt: 1
          },
          totalStakedLimor: { $sum: '$limorstakes.stakeAmount' }
        }
      }
    ])
    return data[0]
  },
  getWalletDetails: async function (userId) {
    const User = mongoose.model('User'),
      result = await User.findOne(
        { _id: userId },
        { 'nonCustodyWallet.wallet': 1 }
      )
        .lean()
        .exec()
    if (!result.nonCustodyWallet) {
      return null
    }
    return result.nonCustodyWallet.map(obj => {
      return obj.wallet
    })
  },
  findUserByReferalCode: async function (referralCode) {
    const User = mongoose.model('User'),
      result = User.findOne({ referalCode: referralCode }).lean().exec()
    return result
  },
  updateReferalCode: async function (userId, referalCode) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { referalCode },
        { new: true }
      )
    return result
  },
  deleteAccount: async function (userId) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate({ _id: userId }, [
        {
          $set: {
            email: {
              $concat: ['$email', '_deleted_', new Date().toISOString()]
            },
            userName: {
              $concat: ['$userName', '_deleted_', new Date().toISOString()]
            },
            phone: 'deleted',
            name: 'deleted',
            isDeleted: true
          }
        }
      ])
    return result
  },
  getAllpractitioners: async function (category, featured, page, searchTerm) {
    let criteria = {
        _id: ObjectId('634e7102f9d9c731c9549274'),
        isPractitioner: true,
        isDeleted: false,
        isActive: true,
        'avatar.path': { $ne: '' }
      },
      limit = 18
    page = Number(page)
    const User = mongoose.model('User')
    if (category !== 'All') {
      criteria.practitionerCategory = category
    }
    if (featured !== 'all') {
      criteria.isMetaverse = featured
    }
    return await User.aggregate([
      {
        $search: {
          index: 'pvSearch',
          wildcard: {
            query: searchTerm,
            path: 'name',
            allowAnalyzedField: true
          }
        }
      },
      {
        $match: criteria
      },
      { $sort: { updatedAt: -1 } }
    ])
      .skip((page - 1) * limit)
      .limit(limit)
  },
  getAllInstitutions: async function (category, featured, page, searchTerm) {
    let criteria = { isInstitution: true, isDeleted: false, isActive: true },
      limit = 18
    page = Number(page)
    const User = mongoose.model('User')
    if (category !== 'All') {
      criteria.practitionerCategory = category
    }
    if (featured !== 'all') {
      criteria.isMetaverse = featured
    }
    return await User.aggregate([
      {
        $match: criteria
      }
    ])
      .skip((page - 1) * limit)
      .limit(limit)
  }
}

UserSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'name userName email createdAt'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },
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

UserSchema.index(
  {
    referalCode: 1
  },
  {
    email: 1
  },
  { authToken: 1 },
  { userName: 1 },
  { email: 1, isEmailVerified: 1 },
  { email: 1, userName: 1 },
  { category: 1, practitionerCategory: 1, isMetaverse: 1 },
  { name: 'text' },
  { bio: 'text' },
  { location: 'text' },
  { userName: 'text' }
)

module.exports = mongoose.model('User', UserSchema)
