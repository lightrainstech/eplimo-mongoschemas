const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const { customAlphabet } = require('nanoid')
const crypto = require('crypto')
const nanoidLong = customAlphabet(
  'XU9GRa5PgTNeDVbMmFnCl23H4vwSzYsqfrLdyOIKWZ78hkJ6xEjcQtABpu',
  32
)

const CorporateSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
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
    corpSecret: {
      type: String
    },
    referralCode: {
      type: String
    },
    category: {
      type: String,
      enum: ['corp', 'b2b'],
      default: 'corp'
    }
  },
  { timestamps: true }
)

// CorporateSchema.pre('save', async function (next) {
//   this.corpSecret = nanoidLong()
//   next()
// })

CorporateSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

CorporateSchema.methods = {
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
  getById: async function (id) {
    const Corporate = mongoose.model('Corporate')
    return await Corporate.findOne(
      { _id: id },
      {
        email: 1,
        name: 1,
        corpSecret: 1,
        salt: 1,
        hashedPassword: 1
      }
    ).exec()
  },
  getCorpDetails: async function (cId) {
    try {
      const Corporate = mongoose.model('Corporate')
      return await Corporate.find(
        { _id: ObjectId(cId) },
        { email: 1, corpSecret: 1, name: 1, referralCode: 1 }
      ).limit(1)
    } catch (error) {
      throw error
    }
  },
  authUserNameOrEmail: async function (creds) {
    const Corporate = mongoose.model('Corporate')
    let query = {
      email: creds
    }
    let result = await Corporate.find(query).limit(1).exec()
    return result.length > 0 ? result[0] : null
  },
  updateReferalCode: async function (userId, referalCode) {
    const Corporate = mongoose.model('Corporate'),
      result = await Corporate.findOneAndUpdate(
        { _id: userId },
        { $set: { referralCode: referalCode } },
        { new: true }
      )
    return result
  }
}

module.exports = mongoose.model('Corporate', CorporateSchema)
