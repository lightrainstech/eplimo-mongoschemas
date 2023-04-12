const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const CorpChallengeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: '--'
    },
    description: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    image: {
      path: {
        type: String
      },
      mimeType: {
        type: String
      }
    },
    corpId: {
      type: ObjectId,
      ref: 'Corporate',
      required: true
    }
  },
  { timestamps: true }
)

CorpChallengeSchema.methods = {
  getChallengeById: async function (corpId, challengeId) {
    const challengeModel = mongoose.model('CorpChallenge')
    return await challengeModel.find({
      _id: ObjectId(challengeId),
      corpId: ObjectId(corpId)
    })
  },
  getAllChallengesByCorp: async function (corpId, page) {
    const challengeModel = mongoose.model('CorpChallenge')
    let options = { criteria: { corpId: ObjectId(corpId) }, page: Number(page) }
    console.log(options)
    return await challengeModel.listForPagination(options)
  }
}
CorpChallengeSchema.statics = {
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

CorpChallengeSchema.index({
  _id: 1,
  corpId: 1
})

module.exports = mongoose.model('CorpChallenge', CorpChallengeSchema)
