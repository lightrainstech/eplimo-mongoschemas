const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { v5 } = require('uuid')

const socialSchema = {
  url: String
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
      required: true,
      unique: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    // custodyWallet: {
    //   type: String,
    //   required: true,
    //   unique: true
    // },
    // nonCustodyWallet: {
    //   type: String
    // },
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lpoCategory: {
      type: String,
      requires: true,
      enum: [
        'Ayurveda Centre',
        'Fitness Center',
        'Fitness Centre',
        'Health Care',
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
        'Nutritionist',
        'Physiotherapist',
        'Psychologist',
        'Yoga expert',
        'Na'
      ],
      default: 'Na'
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
        'Na'
      ],
      default: 'Na'
    },
    isKycVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
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
  generateJWT: function () {
    return jwt.sign(
      {
        hash: this.hashed_password,
        userName: this.userName,
        exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXPIRY)
      },
      process.env.JWT_SECRET
    )
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
      hashed_password: 1,
      isActive: 1
    }).exec()
  },
  setAuthToken: async function (email, authToken) {
    const User = mongoose.model('User')
    return await User.findOneAndUpdate(
      { email: email },
      { $set: { authToken: authToken } },
      { new: true }
    )
  }
}

module.exports = mongoose.model('User', UserSchema)
