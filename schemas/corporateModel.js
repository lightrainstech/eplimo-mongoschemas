const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const { customAlphabet } = require('nanoid')
const nanoidLong = customAlphabet(
  'XU9GRa5PgTNeDVbMmFnCl23H4vwSzYsqfrLdyOIKWZ78hkJ6xEjcQtABpu',
  16
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
    corporateId: {
      type: String
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
    }
  },
  { timestamps: true }
)

CorporateSchema.pre('save', async function (next) {
  this.corporateId = nanoidLong()
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
  }
}

module.exports = mongoose.model('CorporateSchema', CorporateSchema)
