const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const nanoidLong = customAlphabet(
  'XU9GRa5PgTNeDVbMmFnCl23H4vwSzYsqfrLdyOIKWZ78hkJ6xEjcQtABpu',
  8
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
    }
  },
  { timestamps: true }
)

CorporateSchema.pre('save', async function (next) {
  this.corporateId = nanoidLong()
  next()
})

module.exports = mongoose.model('CorporateSchema', CorporateSchema)
