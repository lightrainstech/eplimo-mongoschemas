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
const Stake = require('./schemas/stakeModel')
const ReStake = require('./schemas/reStakeModel')
const TwoxStake = require('./schemas/twoxStakeModel')
const Availability = require('./schemas/availabilityModel')
const Booking = require('./schemas/bookingModel')
const Service = require('./schemas/serviceModel')
const AppLogin = require('./schemas/appLoginModel')
const ServicePurchase = require('./schemas/sericePurchaseModel')
const Corporate = require('./schemas/corporateModel')
const ActivityReward = require('./schemas/activityRewardModel')
const DirectStake = require('./schemas/directStakeModel')
const WebhookLog = require('./schemas/webhookLogModel')
const YieldHistory = require('./schemas/yieldHistory.js')
const ThryveAuthToken = require('./schemas/thryveAuthTokenModel.js')
const VestingList = require('./schemas/vestingListModel.js')
const BonusReleaseConsent = require('./schemas/bonusReleaseConsentModel')
const CorpChallenge = require('./schemas/corpChallengeModel')
const CorpChallengeParticipant = require('./schemas/corpChallengeParticipantModel')
const StakeReleaseConsent = require('./schemas/stakeReleaseConsentModel')
const Testimonial = require('./schemas/partnerverse/testimonialModel')
const B2B = require('./schemas/b2bUsers')
const B2BPurchase = require('./schemas/b2bPurchase')
const RelationshipSchema = require('./schemas/relationshipSchema')
const NftPurchase = require('./schemas/nftPurchase')
const BonusReleaseStatusRecord = require('./schemas/bonusReleaseStatusRecord')
const MultiLevelIncomeRecord = require('./schemas/multiLevelIncomeRecord')
const GigNftRecord = require('./schemas/gigNFTRecord')
const LeadsRecord = require('./schemas/leadGenerationRecord')
const TokenPurchase = require('./schemas/tokenPurchase')
const CourseEnrollment = require('./schemas/courseEnrollmentModel')
const Course = require('./schemas/courseModel')
const CoursePayment = require('./schemas/coursePaymentModel')
const SubscriptionPlan = require('./schemas/subscriptionPlanModel')
const CourseRating = require('./schemas/courseRatingModel')
const Subscription = require('./schemas/subscriptionModel')
const InviteBonus = require('./schemas/inviteBonusModel')
const HealthInfo = require('./schemas/healthInfoModel')
const TrainingInfo = require('./schemas/trainingInfo')
const HealthGoals = require('./schemas/healthGoals')
const WearableAuthToken = require('./schemas/werableAuthTokenModel')
const LftPurchaseOrder = require('./schemas/lftOrders')
const BinahVitals = require('./schemas/binahVitals')
const AiCoachingInfo = require('./schemas/aiCoachingInfo')
const SubscriptionPayment = require('./schemas/subscriptionPayment')
const Credits = require('./schemas/creditsModel')
const CreditTransaction = require('./schemas/creditTransactions')
const ServicePayment = require('./schemas/servicePayment')
const Partner = require('./schemas/partners')
const PartnerService = require('./schemas/partnerServiceModel')
const DailyHealthTips = require('./schemas/dailyHealthTips')

module.exports = {
  Admin,
  PreSale,
  Referral,
  Reward,
  StakingReward,
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
  Withdraw,
  Stake,
  ReStake,
  TwoxStake,
  Availability,
  Booking,
  Service,
  AppLogin,
  ServicePurchase,
  Corporate,
  ActivityReward,
  DirectStake,
  WebhookLog,
  YieldHistory,
  ThryveAuthToken,
  VestingList,
  BonusReleaseConsent,
  CorpChallenge,
  CorpChallengeParticipant,
  StakeReleaseConsent,
  Testimonial,
  B2B,
  B2BPurchase,
  RelationshipSchema,
  NftPurchase,
  BonusReleaseStatusRecord,
  MultiLevelIncomeRecord,
  GigNftRecord,
  LeadsRecord,
  TokenPurchase,
  CourseEnrollment,
  Course,
  CoursePayment,
  CourseRating,
  SubscriptionPlan,
  Subscription,
  InviteBonus,
  HealthInfo,
  TrainingInfo,
  HealthGoals,
  WearableAuthToken,
  LftPurchaseOrder,
  BinahVitals,
  AiCoachingInfo,
  SubscriptionPayment,
  Credits,
  CreditTransaction,
  ServicePayment,
  Partner,
  PartnerService,
  DailyHealthTips
}
