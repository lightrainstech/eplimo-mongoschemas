const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const appLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    dateIndex: {
      type: String
    },
    isProcessed: {
      type: Boolean,
      default: false
    },
    bonus: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

appLoginSchema.methods = {
  getByEmail: async function (email) {
    const AppLogin = mongoose.model('AppLogin')
    return AppLogin.find({
      email
    }).limit(1)
  },
  updateStatus: async function (email) {
    const AppLogin = mongoose.model('AppLogin')
    return AppLogin.findOneAndUpdate(
      {
        email
      },
      { $set: { isProcessed: true } },
      { new: true }
    ).limit(1)
  }
}
appLoginSchema.index({
  email: 1
})

module.exports = mongoose.model('AppLogin', appLoginSchema)
