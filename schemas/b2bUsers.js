const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const B2BSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    b2b: {
      type: Schema.ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

B2BSchema.methods = {
  getUsersByB2B: async b2bId => {
    try {
      const B2BUsers = mongoose.model('B2B')
      return await B2BUsers.find({ b2b: ObjectId(b2bId) }).populate({
        path: 'user',
        select: 'name email username referalCode',
        match: {
          referalCode: ''
        }
      })
    } catch (error) {
      throw error
    }
  },
  getInfluencersByB2B: async b2bId => {
    try {
      const B2BUsers = mongoose.model('B2B')
      return await B2BUsers.find({ b2b: ObjectId(b2bId) }).populate({
        path: 'user',
        select: 'name email username referalCode',
        match: {
          referalCode: { $ne: '' }
        }
      })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('B2B', B2BSchema)
