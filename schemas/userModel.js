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
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
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
      type: String,
      required: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    custodyWallet: {
      type: String
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
        'Medicine',
        'Ayurveda',
        'Homeo',
        'Naturopathy',
        'Diet',
        'Fitness practitioner',
        'Yoga practitioner',
        'Meditation',
        'Wellness clinic',
        'Wellness food',
        'Health store',
        'Yoga Center',
        'Fitness Center / Gym',
        'Wellness Center',
        'Hospital',
        'Zumba Center',
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
        nonCustodyWallet: 1
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
    return User.findOne(query, {
      email: 1,
      userName: 1,
      salt: 1,
      hashedPassword: 1,
      isActive: 1,
      nonCustodyWallet: 1
    }).exec()
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
        select: 'email'
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
  updateWallet: async function (wallet, userId) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { nonCustodyWallet: { wallet } } },
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
  getWalletVerifyStatus: async function (userId, wallet) {
    const User = mongoose.model('User'),
      result = await User.findOne({
        _id: userId,
        nonCustodyWallet: { $elemMatch: { wallet: wallet } }
      })
    return result
  },
  updateWalletVerifyStatus: async function (userId, wallet) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        {
          _id: userId,
          nonCustodyWallet: { $elemMatch: { wallet: wallet } }
        },
        { $set: { 'nonCustodyWallet.$.isVerified': true } },
        { new: true }
      )
    return result
  }
}

UserSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'name userName email createdAt'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  }
}

module.exports = mongoose.model('User', UserSchema)
