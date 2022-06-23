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
    createdAt: 1,
    updatedAt: 1,
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
    price: {
      type: String,
      default: '0'
    },
    isMinted: {
      type: Boolean,
      default: false
    },
    attributes: [],
    category: {
      type: String,
      enum: ['Basic', 'Standard', 'Pro', 'Ultra'],
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
    }
  },
  {
    timestamps: true
  }
)

AssetSchema.methods = {
  listAllAssets: async function (args) {
    const AssetModel = mongoose.model('Asset')

    let { category, sort, status, page } = args,
      criteria = {},
      sortRule = {}
    page = page === 0 ? 0 : page - 1
    let limit = 16,
      skipLimit = limit * page

    if (sort === 'asc') {
      sortRule = { price: 1 }
    } else if (sort === 'desc') {
      sortRule = { price: -1 }
    } else {
      sortRule = { createdAt: -1 }
    }

    if (category !== undefined) {
      criteria.category = category
    }

    if (status == 'onSale') {
      criteria.onSale = true
    } else if (status == 'onAuction') {
      criteria.onAuction = true
    } else {
      $or: [{ 'criteria.onSale': true }, , { 'criteria.onAuction': true }]
    }
    return await AssetModel.aggregate([
      {
        $match: criteria
      },
      {
        $sort: sortRule
      },
      { $limit: limit },
      { $skip: skipLimit },
      {
        $lookup: assetPopulateQueries.auction
      },
      {
        $project: assetPopulateQueries.assetProject
      }
    ])
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
  listAssetByOwner: async function (owner, option, page) {
    const AssetModel = mongoose.model('Asset')

    let criteria = {
      owner: owner
    }
    page = page === 0 ? 0 : page - 1
    let limit = 16,
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
      { $limit: limit },
      { $skip: skipLimit },
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
        criteria: { _id: ObjectId(assetId), onSale: true, orderStatus: 'open' }
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
  getAssetDetailsByUser: async function (nftId, userId) {
    const Asset = mongoose.model('Asset'),
      options = { criteria: { _id: ObjectId(nftId), owner: ObjectId(userId) } }
    return await Asset.load(options)
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
        onAuction: false,
        price: '0'
      },
      { new: true }
    )
    return result
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
    const limit = parseInt(options.limit) || 16
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
  { description: 'text' }
)

AssetSchema.index(
  {
    name: 'text',
    description: 'text'
  },
  { autoIndex: true }
)

module.exports = mongoose.model('Asset', AssetSchema)
