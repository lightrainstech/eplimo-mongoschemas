'use strict'

const assetPopulateQueries = {
  auction: {
    from: 'auctions',
    let: { assetIdForAuctions: '$_id' },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$asset', '$$assetIdForAuctions'] },
              { $eq: ['$isActive', true] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          timeStart: 1,
          timeEnd: 1,
          basePrice: 1,
          numberOfCopy: 1,
          currentBidPrice: 1,
          isActive: 1
        }
      }
    ],
    as: 'auctionDetails'
  },
  assetProject: {
    creator: 1,
    owner: 1,
    tokenId: 1,
    name: 1,
    description: 1,
    asset: 1,
    onSale: 1,
    onAuction: 1,
    price: 1,
    durability: 1,
    efficiencyIndex: 1,
    flexibility: 1,
    grip: 1,
    comfort: 1,
    thumbnail: 1,
    isMinted: 1,
    attributes: 1,
    category: 1,
    tags: 1,
    metaDataUrl: 1,
    royalty: 1,
    royaltyWallet: 1,
    orderStatus: 1,
    sneakerLife: 1,
    projectName: 1,
    createdAt: 1,
    updatedAt: 1,
    isWearable: 1,
    auctionDetails: { $first: '$auctionDetails' }
  }
}

// External Dependancies
const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId

const asset = {
  path: {
    type: String
  },
  mimeType: {
    type: String
  }
}

const AssetSchema = new mongoose.Schema(
  {
    creator: { type: String, required: true },
    owner: { type: String },
    tokenId: { type: Number, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    asset: asset,
    thumbnail: {
      type: String
    },
    onSale: {
      type: Boolean,
      default: false
    },
    onAuction: {
      type: Boolean,
      default: false
    },
    durability: {
      type: Number,
      required: true
    },
    flexibility: {
      type: Number,
      required: true
    },
    grip: {
      type: Number,
      required: true
    },
    comfort: {
      type: Number,
      required: true
    },
    efficiencyIndex: {
      type: Number,
      required: true
    },
    sneakerLife: {
      type: Number,
      default: 100
    },
    price: {
      type: String,
      default: '0'
    },
    projectName: {
      type: String,
      enum: [
        'healthfi',
        'wealthfi',
        'creatfi',
        'datafi',
        'modifi',
        'superHumanTribe'
      ],
      default: 'healthfi',
      required: true
    },
    isMinted: {
      type: Boolean,
      default: false
    },
    attributes: [],
    category: {
      type: String,
      enum: ['Basic', 'Standard', 'Pro', 'Ultra', 'Trial'],
      required: true
    },
    tags: [
      {
        type: String,
        default: () => []
      }
    ],
    metaDataUrl: {
      type: String
    },
    royalty: {
      type: String,
      default: ''
    },
    royaltyWallet: {
      type: String,
      default: ''
    },
    orderStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    corpId: {
      type: String
    },
    isWearable: {
      type: Boolean,
      default: false
    },
    isStaked: {
      type: Boolean,
      default: false
    },
    isUsedForHealtifi: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

AssetSchema.methods = {
  listAllAssets: async function (args) {
    const AssetModel = mongoose.model('Asset')
    let {
        category,
        sort,
        status,
        page,
        maxPrice,
        minPrice,
        isWearable,
        corpId
      } = args,
      criteria = {},
      sortRule = {}
    criteria = {
      $and: [
        {
          price: {
            $gte: minPrice
          }
        },
        {
          price: {
            $lte: maxPrice
          }
        }
      ]
    }

    if (isWearable) {
      criteria.isWearable = isWearable
    } else {
      criteria.isWearable = { $ne: true }
    }
    if (corpId !== null) {
      criteria.corpId = corpId
    } else {
      criteria.corpId = ''
    }
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    if (sort === 'asc') {
      sortRule = { price: 1 }
    } else if (sort === 'desc') {
      sortRule = { price: -1 }
    } else {
      sortRule = { updatedAt: -1 }
    }

    if (category !== undefined) {
      criteria.category = category
    } else {
      criteria.category = { $in: ['Basic', 'Standard', 'Pro', 'Ultra'] }
      criteria.efficiencyIndex = { $in: [20, 25, 30, 35, 40, 45, 50, 55, 60] }
    }

    if (status == 'onSale') {
      criteria.onSale = true
    } else if (status == 'onAuction') {
      criteria.onAuction = true
    } else {
      criteria.$or = [{ onSale: true }, { onAuction: true }]
    }
    return await AssetModel.aggregate([
      {
        $set: {
          price: { $toDouble: '$price' }
        }
      },
      {
        $match: criteria
      },
      {
        $sort: sortRule
      },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      },
      { $sample: { size: 5500 } }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  getAssetDetailsByIdForPublic: async function (assetId) {
    const Asset = mongoose.model('Asset')
    return await Asset.aggregate([
      {
        $match: { _id: ObjectId(assetId) }
      },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      }
    ])
  },
  listAssetByOwner: async function (owner, option, isWearable, page) {
    const AssetModel = mongoose.model('Asset')

    let criteria = {
      owner: { $in: owner }
    }
    if (isWearable) {
      criteria.isWearable = isWearable
    } else {
      criteria.isWearable = { $ne: true }
    }
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    if (option === 'onSale') {
      criteria['onSale'] = true
    }
    if (option === 'onAuction') {
      criteria['onAuction'] = true
    }

    return await AssetModel.aggregate([
      {
        $match: criteria
      },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  getAllAssetsByOwner: async function (owner) {
    const AssetModel = mongoose.model('Asset')

    let criteria = {
      owner: { $in: owner }
    }

    return await AssetModel.aggregate([
      {
        $match: criteria
      },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      }
    ])
  },
  getAssetByIdForTransfer: async function (assetId) {
    const Asset = mongoose.model('Asset'),
      options = {
        criteria: { _id: ObjectId(assetId), onSale: true }
      }
    return await Asset.load(options).lean().exec()
  },
  updateOrderStatus: async function (asset, status) {
    const Asset = mongoose.model('Asset'),
      result = await Asset.findOneAndUpdate(
        { _id: ObjectId(asset) },
        { orderStatus: status },
        { new: true }
      )
    return result
  },
  addToSale: async function (seller, tokenId, price) {
    const Asset = mongoose.model('Asset'),
      result = await Asset.findOneAndUpdate(
        { tokenId, owner: seller },
        { price, onSale: true },
        { new: true }
      )
    return result
  },
  removeFromSale: async function (seller, tokenId) {
    const Asset = mongoose.model('Asset'),
      result = await Asset.findOneAndUpdate(
        { tokenId, owner: seller },
        { price: 0, onSale: false },
        { new: true }
      )
    return result
  },
  transferAssetOwnership: async function (tokenId, buyer) {
    const AssetModel = mongoose.model('Asset')
    const result = await AssetModel.findOneAndUpdate(
      { tokenId },
      {
        owner: buyer,
        onSale: false,
        onAuction: false
      },
      { new: true }
    )
    return result
  },
  getAssetDetailById: async function (nftId) {
    const Asset = mongoose.model('Asset'),
      options = { criteria: { _id: nftId } }
    return await Asset.load(options)
  },
  updateSneakerLife: async function (nftId, totalDistance) {
    const Asset = mongoose.model('Asset'),
      result = await Asset.findOneAndUpdate(
        { _id: nftId },
        { $inc: { sneakerLife: -totalDistance } },
        { new: true }
      )
    return result
  },
  repairSneaker: async function (nftId) {
    const Asset = mongoose.model('Asset'),
      result = await Asset.findOneAndUpdate(
        { _id: nftId },
        { $set: { sneakerLife: 100, orderStatus: 'open' } },
        { new: true }
      )
    return result
  },
  checkAssetDetails: async function (tokenId, nftId) {
    const Asset = mongoose.model('Asset'),
      options = { criteria: { _id: nftId, tokenId: tokenId } }
    return await Asset.load(options)
  },
  listMyProjects: async function (owner) {
    const AssetModel = mongoose.model('Asset')
    const result = await AssetModel.aggregate([
      {
        $match: {
          owner: { $in: owner }
        }
      },
      {
        $group: {
          _id: null,
          myProjects: {
            $addToSet: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$projectName', 'creatfi'] },
                    then: 'creatfi'
                  },
                  {
                    case: { $eq: ['$projectName', 'superHumanTribe'] },
                    then: 'superHumanTribe'
                  },
                  {
                    case: { $eq: ['$projectName', 'healthfi'] },
                    then: 'healthfi'
                  },
                  {
                    case: { $eq: ['$projectName', 'modifi'] },
                    then: 'modifi'
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          myProjects: 1
        }
      }
    ])
    if (result.length > 0) return result[0]
    else return { _id: 0, myProjects: [] }
  },
  getAssetsAllData: async function () {
    const Asset = mongoose.model('Asset'),
      data = await Asset.aggregate([
        {
          $match: {
            category: { $ne: 'Trial' },
            onSale: false
          }
        },
        {
          $lookup: {
            from: 'activities',
            localField: '_id',
            foreignField: nft,
            as: 'activitydata'
          }
        },
        {
          $unwind: '$activitydata'
        },
        {
          $lookup: {
            from: 'payments',
            pipeline: [
              {
                $match: {
                  asset: activitydata._id,
                  transactionType: 'repairSneaker'
                }
              }
            ],
            as: 'paymentdata'
          }
        }
      ])
  },
  corpGetAssetsByFilter: async function (args) {
    const AssetModel = mongoose.model('Asset')

    let { page, sort, corpId } = args,
      criteria = {
        corpId: corpId
      },
      sortRule = {}
    page = page === 0 ? 0 : page - 1
    let limit = 18,
      skipLimit = limit * page

    if (sort === 'asc') {
      sortRule = { price: 1 }
    } else if (sort === 'desc') {
      sortRule = { price: -1 }
    } else {
      sortRule = { createdAt: -1 }
    }

    return await AssetModel.aggregate([
      {
        $set: {
          price: { $toDouble: '$price' }
        }
      },
      {
        $match: criteria
      },
      {
        $sort: sortRule
      }
    ])
      .skip(skipLimit)
      .limit(limit)
  },
  getCorpAssetsByOwner: async function (owner, corpId) {
    const AssetModel = mongoose.model('Asset')

    let criteria = {
      owner: { $in: owner },
      corpId: corpId
    }

    return await AssetModel.aggregate([
      {
        $match: criteria
      },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      }
    ])
  },
  lockCorpNft: async function (corpId, owner) {
    const AssetModel = mongoose.model('Asset')
    try {
      return await AssetModel.findOneAndUpdate(
        { corpId, owner: owner, orderStatus: 'open' },
        { $set: { orderStatus: 'closed' } },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  corpGetAllAsset: async function (corpId, creator, page) {
    const AssetModel = mongoose.model('Asset')
    try {
      let criteria = {
          owner: { $ne: creator },
          corpId: corpId
        },
        limit = 18,
        skipLimit = limit * page

      return await AssetModel.aggregate([
        {
          $match: criteria
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: 'custodyWallet.wallet',
            as: 'users'
          }
        },
        {
          $project: { users: 1, _id: 0 }
        }
      ])
        .skip(skipLimit)
        .limit(limit)
    } catch (error) {
      throw error
    }
  },
  corpGetAssetCount: async function (corpId, creator) {
    try {
      const AssetModel = mongoose.model('Asset')
      return await AssetModel.aggregate([
        {
          $match: { corpId: corpId }
        },
        {
          $group: {
            _id: '$corpId',
            totalNFT: {
              $sum: 1
            },
            soldNFT: {
              $sum: {
                $cond: {
                  if: {
                    $ne: ['$owner', creator]
                  },

                  then: 1,
                  else: 0
                }
              }
            },
            unSoldNFT: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ['$owner', creator]
                  },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  corpGetActivity: async function (args) {
    try {
      let { corpId, creator, page } = args
      page = page === 0 ? 0 : page - 1
      let limit = 18,
        skipLimit = limit * page
      const AssetModel = mongoose.model('Asset')
      return await AssetModel.aggregate([
        {
          $match: {
            corpId,
            owner: { $ne: creator }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner', // Use localField as it's directly from the asset
            foreignField: 'custodyWallet.wallet', // Assuming this is how the relationship works
            as: 'users'
          }
        },
        {
          $unwind: {
            path: '$users',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'activityrewards',
            localField: 'users._id',
            foreignField: 'user',
            as: 'rewards'
          }
        },
        {
          $lookup: {
            from: 'activities',
            localField: 'users._id',
            foreignField: 'user',
            as: 'activities'
          }
        },
        {
          $group: {
            _id: '$users._id',
            tokenId: { $first: '$tokenId' },
            nftId: { $first: '$_id' },
            name: { $first: '$name' },
            category: { $first: '$category' },
            efficiencyIndex: { $first: '$efficiencyIndex' },
            image: { $first: '$asset' },
            fullName: { $first: '$users.name' },
            userName: { $first: '$users.userName' },
            email: { $first: '$users.email' },
            totalLimos: { $sum: { $ifNull: ['$rewards.limos', 0] } }, // Handle missing rewards
            totalDistance: { $sum: { $ifNull: ['$activities.distance', 0] } }, // Handle missing activities
            totalPoints: { $sum: { $ifNull: ['$activities.point', 0] } } // Handle missing activities
          }
        },
        { $skip: skipLimit },
        { $limit: limit }
      ])
    } catch (error) {
      throw error
    }
  },
  listGigNft: async function (wallet, corpId, page) {
    try {
      const AssetModel = mongoose.model('Asset')
      page = page === 0 ? 0 : page - 1
      let limit = 18,
        skipLimit = limit * page

      return await AssetModel.aggregate([
        {
          $match: {
            owner: wallet,
            corpId: corpId
          }
        },
        {
          $lookup: assetPopulateQueries.auction
        },
        {
          $project: assetPopulateQueries.assetProject
        }
      ])
        .skip(skipLimit)
        .limit(limit)
    } catch (error) {
      throw error
    }
  },
  stakeNFT: async function (wallet, corpId, nftId) {
    try {
      const AssetModel = mongoose.model('Asset')
      return await AssetModel.findOneAndUpdate(
        { owner: wallet, corpId, _id: nftId, isUsedForHealtifi: false },
        {
          $set: {
            isStaked: true
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  useNftForHealtifi: async function (wallet, corpId, nftId) {
    try {
      const AssetModel = mongoose.model('Asset')
      return await AssetModel.findOneAndUpdate(
        { owner: wallet, corpId, _id: nftId, isStaked: false },
        {
          $set: {
            isUsedForHealtifi: true
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  }
}

AssetSchema.statics = {
  load: function (options) {
    options.select = options.select || ''
    return this.findOne(options.criteria).select(options.select)
  },

  list: function (options) {
    const criteria = options.criteria || {}
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria).select(select).sort(sortRule).populate(populate)
  },

  listForPagination: function (options) {
    const criteria = options.criteria || {}
    const page = options.page === 0 ? 0 : options.page - 1
    const limit = parseInt(options.limit) || 18
    const sortRule = options.sortRule || {}
    const select = options.select || ''
    const populate = options.populate || ''
    return this.find(criteria)
      .select(select)
      .sort(sortRule)
      .limit(limit)
      .skip(limit * page)
      .populate(populate)
      .lean()
      .exec()
  }
}

AssetSchema.index(
  {
    owner: 1
  },
  {
    owner: 1,
    status: 1
  },
  {
    tokenId: 1
  },
  {
    name: 'text'
  },
  { description: 'text' },
  {
    owner: 1,
    corpId: 1
  }
)

AssetSchema.index(
  {
    name: 'text',
    description: 'text'
  },
  { autoIndex: true }
)

module.exports = mongoose.model('Asset', AssetSchema)
