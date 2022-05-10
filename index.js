'use strict'
if (typeof process.env.MONGO_CONN === 'undefined' && !process.env.MONGO_CONN) {
  console.log('Error: 🔥 Invalid mongo connection string')
  process.exit(1)
}

const mongoose = require('mongoose')
mongoose
  .connect(process.env.MONGO_CONN)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err))

const Admin = require('./schemas/adminModel.js')
const PreSale = require('./schemas/presaleModel.js')
const Referral = require('./schemas/referralModel.js')
const Reward = require('./schemas/rewardModel.js')
const Reward = require('./schemas/rewardModel.js')
const StakingReward = require('./schemas/stakingRewardModel.js')

module.exports = {
  Admin,
  PreSale,
  Referral,
  Reward,
  StakingReward
}
