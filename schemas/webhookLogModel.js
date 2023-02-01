const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const WebhookLogSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
)

WebhookLogSchema.index(
  {
    createdAt: 1
  },
  { expireAfterSeconds: 2592000 }
)

module.exports = mongoose.model('WebhookLog', WebhookLogSchema)
