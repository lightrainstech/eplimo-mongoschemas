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
    }
  },
  { timestamps: true }
)

CorporateSchema.pre('save', async function (next) {
  this.corpSecret = nanoidLong()
  next()
})

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
  getCorpDetails: async function (cId) {
    try {
      const Corporate = mongoose.model('Corporate')
      return await Corporate.find(
        { _id: cId },
        { email: 1, corpSecret: 1, name: 1 }
      ).limit(1)
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('Corporate', CorporateSchema)
