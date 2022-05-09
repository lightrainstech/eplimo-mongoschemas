'use strict'
// External Dependancies
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const SALT_ROUNDS = 10
const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '--'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      required: true,
      enum: ['admin'],
      default: 'admin'
    },
    hashedPassword: {
      type: String
    },
    salt: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

AdminSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashedPassword = this.encryptPassword(password)
  })

  .get(function () {
    return this._password
  })

AdminSchema.methods = {
  makeSalt: function () {
    return bcrypt.genSaltSync(SALT_ROUNDS)
  },

  encryptPassword: function (password) {
    if (!password) return ''
    return bcrypt.hashSync(password, this.salt)
  },
  authenticate: function (plainText) {
    return bcrypt.compareSync(plainText, this.hashedPassword)
  },
  adminLogin: async function (email, password) {
    try {
      const adminModel = mongoose.model('Admin'),
        options = {
          criteria: {
            email: email
          },
          select: 'email hashedPassword role'
        },
        admin = await adminModel.load(options)
      if (admin) {
        const auth = await bcrypt.compare(password, admin.hashedPassword)
        if (auth) {
          return admin
        }
        throw Error('Incorrect Password')
      }
      throw Error('Email Not Registered')
    } catch (err) {
      throw err
    }
  }
}

AdminSchema.statics = {
  load: function (options) {
    options.select = options.select || ''
    return this.findOne(options.criteria).select(options.select)
  }
}

module.exports = mongoose.model('Admin', AdminSchema)
