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
const StakingReward = require('./schemas/stakingRewardModel.js')
const LimoReward = require('./schemas/limoRewardModel.js')
const LimoStake = require('./schemas/limoStakeModel.js')
const User = require('./schemas/userModel.js')
const RefreshToken = require('./schemas/refreshTokenModel.js')
const LimoPoint = require('./schemas/limoPointModel.js')
const Asset = require('./schemas/assetModel')
const Activity = require('./schemas/activityModel.js')
const ActivityProgress = require('./schemas/activityProgressModel.js')
const Payment = require('./schemas/PaymentModel.js')

module.exports = {
  Admin,
  PreSale,
  Referral,
  Reward,
  StakingReward,
  LimoReward,
  LimoStake,
  User,
  RefreshToken,
  LimoPoint,
  Asset,
  Activity,
  ActivityProgress,
  Payment
}
