const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const RelationshipSchema = new mongoose.Schema(
  {
    parent: {
      type: ObjectId,
      ref: 'User'
    },
    child: {
      type: ObjectId,
      ref: 'User',
      unique: true
    },
    level: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

RelationshipSchema.methods = {
  getUserLevel: async function (child) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.findOne({ child: ObjectId(child) })
    } catch (error) {
      console.log(error)
    }
  },
  getParentDetails: async function (child) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.findOne({
        child: ObjectId(child)
      }).populate({ path: 'parent', select: 'referalCode email' })
    } catch (error) {
      console.log(error)
    }
  },
  checkRelation: async function (parent, child) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.findOne({
        parent: ObjectId(child),
        child: parent
      })
    } catch (error) {
      console.log(error)
    }
  },
  getIfChild: async function (user) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.findOne({
        child: ObjectId(user)
      })
    } catch (error) {
      throw error
    }
  },
  getIfParent: async function (user) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.findOne({
        parent: ObjectId(user)
      })
    } catch (error) {
      throw error
    }
  }
}

RelationshipSchema.index(
  {
    parent: 1
  },
  {
    child: 1
  },
  { parent: 1, child: 1 }
)

module.exports = mongoose.model('RelationshipSchema', RelationshipSchema)
