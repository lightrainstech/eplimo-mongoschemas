const { ObjectId } = mongoose.Types
const Schema = mongoose.Schema

const GigNftSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    nft: {
      type: Schema.ObjectId,
      ref: 'Asset',
      required: true
    },
    avail: {
      type: String,
      enum: ['stake', 'healtifi']
    }
  },
  { timestamps: true }
)

GigNftSchema.methods = {}

module.exports = mongoose.model('GigNft', GigNftSchema)
