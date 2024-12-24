const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ObjectId } = mongoose.Types

const RedeemedOffersSchema = new mongoose.Schema(
  {
    partner: { type: Schema.ObjectId, ref: 'Partner', required: true },
    service: { type: Schema.ObjectId, ref: 'PartnerService', required: true },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    offerCode:{type:String,unique:true,required: true},
    date: {
      type: String
    }
  },
  { timestamps: true }
)

RedeemedOffersSchema.methods={
  checkForRedeemedOffers:async function(args){
    try{
      const {partner,service,date} = args,
        RedeemModel = mongoose.model('RedeemedOffers')
      return await RedeemModel.find({partner,service,date})
    }catch(err){
      throw err
    }

  }
}

RedeemedOffersSchema.index(
  { user: 1, date: 1, service: 1 },
  { unique: true }
)
module.exports = mongoose.model('RedeemedOffers', RedeemedOffersSchema)
