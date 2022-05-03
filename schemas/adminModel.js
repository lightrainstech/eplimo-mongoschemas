'use strict'
// External Dependancies
const mongoose = require('mongoose')
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
    }
  },
  {
    timestamps: true
  }
)

AdminSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.hashedPassword = this.securePassword(password)
  })
  .get(function () {
    return this._password
  })

AdminSchema.methods = {
  adminLogin: async function (email, password) {
    try {
      const adminModel = mongoose.model('Admin'),
        options = {
          criteria: {
            email: email
          },
          select: 'email hashedPassword'
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
