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
  },
  getFirstLevelDescendants: async function (user) {
    try {
      const RelationshipModel = mongoose.model('RelationshipSchema')
      return await RelationshipModel.aggregate([
        {
          $match: { parent: user } // Replace 'parentUserId' with the actual parent's user ID
        },
        {
          $lookup: {
            from: 'users',
            localField: 'child',
            foreignField: '_id',
            as: 'descendant'
          }
        },
        {
          $unwind: '$descendant'
        },
        {
          $lookup: {
            from: 'nftpurchases',
            let: { referralCode: '$descendant.referalCode' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$referralCode', '$$referralCode']
                  }
                }
              },
              {
                $lookup: {
                  from: 'assets',
                  localField: 'nft',
                  foreignField: '_id',
                  as: 'nftDetails'
                }
              },
              {
                $group: {
                  _id: null,
                  totalNFTPrice: {
                    $sum: {
                      $toDouble: { $arrayElemAt: ['$nftDetails.price', 0] }
                    }
                  }
                }
              }
            ],
            as: 'purchaseSummary'
          }
        },
        {
          $lookup: {
            from: 'directstakes',
            localField: 'descendant.referalCode',
            foreignField: 'referralCode',
            as: 'stakesSummary'
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$descendant._id',
            name: '$descendant.name',
            email: '$descendant.email',
            totalNftSale: {
              $arrayElemAt: ['$purchaseSummary.totalNFTPrice', 0]
            },
            totalStakes: { $sum: '$stakesSummary.stake' },
            createdAt: 1
          }
        },
        {
          $group: {
            _id: null,
            nftSalesByLevel: { $sum: '$totalNftSale' },
            stakesByLevel: { $sum: '$totalStakes' },
            descendants: {
              $push: {
                userId: '$userId',
                name: '$name',
                email: '$email',
                totalNftSale: '$totalNftSale',
                totalStakes: '$totalStakes',
                createdAt: '$createdAt'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            nftSalesByLevel: 1,
            stakesByLevel: 1,
            descendants: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  getTotalLevel: async function (user) {
    const RelationshipModel = mongoose.model('RelationshipSchema')
    return await RelationshipModel.aggregate([
      {
        $match: { parent: user } // Replace 'parentUserId' with the actual parent's user ID
      },
      {
        $graphLookup: {
          from: 'relationshipschemas',
          startWith: '$child',
          connectFromField: 'child',
          connectToField: 'parent',
          //maxDepth: 10, // Adjust this value based on your maximum expected depth
          as: 'descendants'
        }
      },
      {
        $unwind: '$descendants'
      },
      {
        $group: {
          _id: null,
          maxLevel: { $max: '$descendants.level' }
        }
      },
      {
        $project: {
          _id: 0,
          numberOfLevels: { $add: ['$maxLevel', 1] } // Add 1 to the max level to count the top-level parent as well
        }
      }
    ])
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
