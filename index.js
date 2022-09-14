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
const Affiliate = require('./schemas/affiliateModel')
const Reward = require('./schemas/rewardModel.js')
const StakingReward = require('./schemas/stakingRewardModel.js')
const LimoReward = require('./schemas/limoRewardModel.js')
const LimoStake = require('./schemas/limoStakeModel.js')
const User = require('./schemas/userModel.js')
const RefreshToken = require('./schemas/refreshTokenModel.js')
const LimoPoint = require('./schemas/limoPointModel.js')
const Asset = require('./schemas/assetModel')
const Activity = require('./schemas/activityModel.js')
const Payment = require('./schemas/paymentModel.js')
const Referral = require('./schemas/referralModel')
const DeleteLog = require('./schemas/deleteLogModel')
const TransferLimo = require('./schemas/transferLimoModel')
const PreSaleRefBonus = require('./schemas/presaleRefBonusModel')
const WhiteList = require('./schemas/whiteListModel')
const Withdraw = require('./schemas/withdrawModel')

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
  Payment,
  Affiliate,
  DeleteLog,
  TransferLimo,
  PreSaleRefBonus,
  WhiteList,
  Withdraw
}
