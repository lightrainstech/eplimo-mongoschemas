const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const inviteBonusSchema = new mongoose.Schema(
  {
    referrer: { type: ObjectId, ref: 'User', required: true },
    referralCode: { type: String },
    user: { type: ObjectId, ref: 'User', required: true },
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

inviteBonusSchema.methods = {
  updateStatus: async function (args) {
    try {
      let { referrer, user } = args
      const InviteBonus = mongoose.model('InviteBonus')
      await InviteBonus.findOneAndUpdate(
        { referrer: referrer, user: user },
        {
          $set: {
            isProcessed: true
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  }
}
inviteBonusSchema.index({
  referrer: 1,
  user: 1
})

module.exports = mongoose.model('InviteBonus', inviteBonusSchema)
