const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ServiceSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    service: {
      type: String
    },
    priceInUSD: {
      type: String,
      default: '0'
    },
    onSale: {
      type: Boolean,
      default: false
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    image: {
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
)

ServiceSchema.methods = {
  getServices: async page => {
    const Service = mongoose.model('Service')
    let options = {
      page: page,
      sortRule: { updatedAt: -1 }
    }
    return await Service.listForPagination(options)
  },
  getServicesByPractitioner: async (pId, page) => {
    const Service = mongoose.model('Service')
    let options = {
      criteria: {
        user: pId,
        $or: [{ isPromoted: true }, { isPromoted: false }]
      },
      page: page,
      sortRule: { isPromoted: -1, updatedAt: -1 },
      select:
        'user service priceInUSD maxLimoR onSale isPromoted image description custodyWallet name email'
    }
    return await Service.listForPagination(options)
  },
  getPublicServicesByPractitioner: async (pId, page) => {
    const Service = mongoose.model('Service')
    let options = {
      criteria: {
        user: pId,
        onSale: true,
        $or: [{ isPromoted: true }, { isPromoted: false }]
      },
      page: page,
      sortRule: { isPromoted: -1, updatedAt: -1 },
      select:
        'user service priceInUSD maxLimoR onSale isPromoted image description custodyWallet name email'
    }
    return await Service.listForPagination(options)
  },
  getServiceDetail: async sId => {
    const Service = mongoose.model('Service')
    return await Service.find({ _id: sId })
      .limit(1)
      .populate({
        path: 'user',
        select:
          'user service priceInUSD maxLimoR onSale isPromoted image description custodyWallet name email'
      })
      .lean()
      .exec()
  },
  updateService: async data => {
    const Service = mongoose.model('Service'),
      {
        userId,
        packageId,
        service,
        price,
        sale,
        promotion,
        image,
        description,
        maxLimoR
      } = data
    return await Service.findOneAndUpdate(
      { _id: packageId, user: userId },
      {
        $set: {
          service,
          priceInUSD: price,
          maxLimoR,
          onSale: sale,
          isPromoted: promotion,
          image,
          description
        }
      },
      { new: true }
    )
  }
}

ServiceSchema.statics = {
  listForPagination: function (options) {
    const criteria = options.criteria || {}
    const page = options.page === 0 ? 0 : options.page - 1
    const limit = parseInt(options.limit) || 18
    const sortRule = options.sortRule || {}
    const select =
      options.select ||
      'service priceInUSD maxLimoR onSale isPromoted image description'
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

ServiceSchema.index({ user: 1 }, { isPromoted: 1 })

module.exports = mongoose.model('Service', ServiceSchema)
