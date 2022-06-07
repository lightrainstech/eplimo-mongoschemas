const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const socialSchema = {
  url: String
}

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user'],
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
    isEmailerified: {
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
    primaryWallet: {
      type: String,
      required: true,
      unique: true
    },
    secondaryWallet: {
      type: String
    },
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
        'Yoga expert'
      ]
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
        'Zumba Center'
      ]
    },
    practitionerDoc: {
      type: String,
      default: '--'
    }
  },
  { timestamps: true }
)

UserSchema.methods = {
  getByEmail: async function (email) {
    const User = mongoose.model('User')
    let data = await Presale.findOne({ email: email })
    if (data) {
      return true
    } else {
      return false
    }
  }
}

module.exports = mongoose.model('User', UserSchema)
