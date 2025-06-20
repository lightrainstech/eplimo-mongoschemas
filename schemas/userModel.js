const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId
const crypto = require('crypto')
const { v5 } = require('uuid')

const socialSchema = {
  url: String
}
const coverPic = {
  path: {
    type: String
  },
  mimeType: {
    type: String
  }
}

const nonCustodyWalletSchema = {
  _id: false,
  wallet: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}

const custodyWalletSchema = {
  _id: false,
  vault: {
    type: String
  },
  wallet: {
    type: String
  }
}

const UserSchema = new mongoose.Schema(
  {
    coverPicture: coverPic,
    role: {
      type: String,
      required: true,
      enum: ['lpo', 'user', 'instructor'],
      default: 'user'
    },
    userName: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    hashedPassword: {
      type: String
    },
    salt: {
      type: String,
      default: ''
    },
    authToken: {
      type: String,
      default: ''
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String
    },
    countryCode: {
      type: String
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    custodyWallet: {
      type: custodyWalletSchema
    },
    nonCustodyWallet: {
      type: [nonCustodyWalletSchema]
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lpoType: {
      type: String,
      enum: ['Organizations', 'Professionals', 'NA'],
      default: 'NA'
    },
    lpoCategory: {
      type: String,
      enum: [
        'Aesthetics',
        'Alternate Healing',
        'Ayurveda Centre',
        'Energy Healing',
        'Fitness Center',
        'Health Food',
        'Health tech products',
        'Hospitals/Clinics',
        'Mind Coach',
        'Other',
        'Training Company',
        'Wellness Centre',
        'Wellness Resort',
        'Yoga Studio',
        'Certified Lifestyle Coach',
        'Dietitian/ Nutritionist',
        'Fitness Trainer',
        'Healer',
        'Health/ Wellness Coach',
        'Life Coach/ Motivational Speaker',
        'Medical Doctor',
        'Meditation Guru',
        'Naturopath',
        'Physiotherapist',
        'Psychologist',
        'Yoga expert',
        'NA'
      ],
      default: 'NA'
    },
    lpoSpecialization: {
      type: String,
      enum: [
        'Gym',
        'Health Clubs',
        'PhysioTherapy',
        'Pilates',
        'Zumba',
        'General wellness',
        'Spa',
        'Speciality',
        'Clinics',
        'Panchakarma',
        'Massage Centre',
        'Meditation',
        'Yoga therapy',
        'Ayurveda',
        'Chinese',
        'Functional Medicine',
        'Homeo',
        'Integrative Medicine',
        'Lifestyle medicine',
        'Naturopathy',
        'Siddha',
        'Sowarigpa',
        'Super Speciality',
        'Unani',
        'Fitness',
        'Health Coaches',
        'Nutrition',
        'Yoga',
        'General',
        'Training and Development',
        'Wellness Related',
        'Other',
        'NA'
      ],
      default: 'NA'
    },
    social: {
      twitter: socialSchema,
      linkedin: socialSchema,
      facebook: socialSchema
    },
    isPractitioner: {
      type: Boolean,
      default: false
    },
    practitionerCategory: {
      type: [String],
      enum: [
        'All',
        'Fitness Training',
        'Yoga Learning',
        'Eating Well',
        'Manage Stress',
        'Meditation Classes',
        'Sleep Well',
        'Reverse Ageing',
        'Alternate Healing',
        'Looking Good',
        'NA'
      ],
      default: ['NA']
    },
    category: {
      type: [String],
      enum: [
        'All',
        'Fitness Training',
        'Yoga Learning',
        'Eating Well',
        'Manage Stress',
        'Meditation Classes',
        'Sleep Well',
        'Reverse Ageing',
        'Alternate Healing',
        'Looking Good',
        'NA'
      ],
      default: ['NA']
    },
    subCategory: {
      type: [String],
      default: []
    },
    isKycVerified: {
      type: Boolean,
      default: false
    },
    referalCode: {
      type: String,
      default: ''
    },
    affiliateCode: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    avatar: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    isInstitution: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    isMetaverse: {
      type: Boolean,
      default: false
    },
    corpId: {
      type: String,
      default: 'limoverse'
    },
    wearableNFT: {
      type: String,
      default: null
    },
    kycStatus: {
      type: String,
      default: null
    },
    kycReferenceId: {
      type: String,
      default: null
    },
    referredBy: {
      type: ObjectId,
      ref: 'User',
      default: null
    },
    stakeClub: {
      type: String,
      default: null
    },
    trainerizeId: {
      type: String,
      default: null
    },
    languages: {
      type: [String],
      default: []
    },
    notificationId: {
      type: String,
      default: null
    },
    credits: { type: Number, required: true, default: 0 },
    hasLimoCardAccount: {
      type: Boolean,
      default: false
    },
    limoCardMeta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
)

UserSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

UserSchema.methods = {
  makeSalt: function () {
    // return Math.round(new Date().valueOf() * Math.random()) + "";
    return crypto.randomBytes(64).toString('hex')
  },

  authenticate: function (plainText) {
    if (this.encryptPassword(plainText) === this.hashedPassword) {
      return { auth: true, data: this }
    } else {
      return { auth: false, data: this }
    }
  },

  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha256', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  },

  getByEmail: async function (email) {
    const User = mongoose.model('User')
    let data = await User.findOne({ email: email })
    if (data) {
      return true
    } else {
      return false
    }
  },
  getById: async function (id) {
    const User = mongoose.model('User')
    return await User.findOne(
      { _id: id },
      {
        email: 1,
        userName: 1,
        salt: 1,
        hashedPassword: 1,
        isActive: 1,
        nonCustodyWallet: 1,
        custodyWallet: 1,
        isInstitution: 1,
        isPractitioner: 1,
        isKycVerified: 1,
        kycStatus: 1
      }
    ).exec()
  },

  generateRefreshToken: function (str) {
    return v5(str, process.env.UUID_NAMESPACE)
  },
  authUserNameOrEmail: async function (creds) {
    const User = mongoose.model('User')
    let query = {
      $or: [{ email: creds }, { userName: creds }]
    }
    let result = await User.find(query)
      .limit(1)
      .populate({ path: 'referredBy', select: 'email' })
      .exec()
    return result.length > 0 ? result[0] : null
  },
  setAuthToken: async function (email, authToken) {
    const User = mongoose.model('User')
    return await User.findOneAndUpdate(
      { email: email },
      { $set: { authToken: authToken } },
      { new: true }
    )
  },
  getUserByEmail: async function (email) {
    const User = mongoose.model('User'),
      options = {
        criteria: { email: email },
        select: 'email, custodyWallet, isPractitioner'
      }
    return await User.load(options)
  },
  getUserById: async function (id) {
    const User = mongoose.model('User'),
      result = await User.findOne({ _id: id }).lean().exec()
    return result
  },
  updateProfile: async function (userId, update) {
    const User = mongoose.model('User'),
      data = await User.findOneAndUpdate(
        { _id: userId },
        { $set: update },
        { new: true }
      )
    return data
  },
  getUserByUserName: async function (userName) {
    const User = mongoose.model('User'),
      options = {
        criteria: { userName: userName }
      }
    return await User.load(options)
  },
  verifyEmail: async function (userId, otp) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: userId, authToken: otp },
        { authToken: null, isEmailVerified: true },
        { new: true }
      )
    return result
  },
  setAuthTokenForEmailVerify: async function (email, authToken) {
    const User = mongoose.model('User')
    return await User.findOneAndUpdate(
      { email: email, isEmailVerified: false },
      { $set: { authToken: authToken } },
      { new: true }
    )
  },
  updateExistingWallet: async function (wallet, userId) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        {
          _id: userId,
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet, isVerified: false }
          }
        },
        { $set: { 'nonCustodyWallet.$.isVerified': true } },
        { new: true }
      )
    return result
  },
  checkIfWalletExists: async function (wallet) {
    const User = mongoose.model('User'),
      options = {
        criteria: {
          isDeleted: false,
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet, isVerified: true }
          }
        }
      }
    return await User.load(options)
  },
  checkForWallet: async function (wallet) {
    const User = mongoose.model('User'),
      options = {
        criteria: {
          isDeleted: false,
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet }
          }
        }
      }
    return await User.load(options)
  },
  updateWallet: async function (wallet, userId) {
    const User = mongoose.model('User'),
      nonCustodyWallet = { wallet, isVerified: true },
      result = await User.findOneAndUpdate(
        {
          _id: ObjectId(userId)
        },
        { $addToSet: { nonCustodyWallet } },
        { new: true }
      )
    return result
  },
  updateCustodyWallet: async function (userId, vault, wallet) {
    const User = mongoose.model('User'),
      custodyWallet = { vault, wallet },
      result = await User.findOneAndUpdate(
        { _id: userId },
        { custodyWallet },
        { new: true }
      )
    return result
  },
  getByIdWithLimorStake: async function (userId) {
    const User = mongoose.model('User')
    let data = await User.aggregate([
      { $match: { _id: ObjectId(userId) } },
      {
        $lookup: {
          from: 'stakingrewards',
          let: { userId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$userId', '$$userId'] } } }],
          as: 'limorstakes'
        }
      },
      {
        $project: {
          email: 1,
          userName: 1,
          salt: 1,
          hashedPassword: 1,
          isActive: 1,
          nonCustodyWallet: 1,
          custodyWallet: 1,
          limorstakes: {
            stakeAmount: 1,
            isApproved: 1,
            isProcesses: 1,
            createdAt: 1,
            wallet: 1,
            _id: 1
          },
          totalStakedLimor: { $sum: '$limorstakes.stakeAmount' }
        }
      }
    ])
    return data[0]
  },
  getWalletDetails: async function (userId) {
    const User = mongoose.model('User'),
      result = await User.findOne(
        { _id: userId },
        { 'nonCustodyWallet.wallet': 1 }
      )
        .lean()
        .exec()
    if (!result.nonCustodyWallet) {
      return null
    }
    return result.nonCustodyWallet.map(obj => {
      return obj.wallet
    })
  },
  getVerifiedWalletDetails: async function (userId) {
    try {
      const User = mongoose.model('User'),
        result = await User.aggregate([
          {
            $match: {
              _id: ObjectId(userId),
              nonCustodyWallet: { $elemMatch: { isVerified: true } }
            }
          },
          {
            $project: {
              matchingElements: {
                $filter: {
                  input: '$nonCustodyWallet',
                  as: 'el',
                  cond: { $eq: ['$$el.isVerified', true] }
                }
              }
            }
          }
        ])
      if (result.length > 0) {
        return true
      } else {
        return false
      }
    } catch (error) {
      throw error
    }
  },
  findUserByReferalCode: async function (referralCode) {
    const User = mongoose.model('User'),
      result = User.findOne({ referalCode: referralCode }).lean().exec()
    return result
  },
  updateReferalCode: async function (userId, referalCode) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: ObjectId(userId), referalCode: { $exists: false } },
        { $set: { referalCode: referalCode } },
        { new: true }
      )
    return result
  },
  deleteAccount: async function (userId) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate({ _id: userId }, [
        {
          $set: {
            email: {
              $concat: ['$email', '_deleted_', new Date().toISOString()]
            },
            userName: {
              $concat: ['$userName', '_deleted_', new Date().toISOString()]
            },
            phone: 'deleted',
            name: 'deleted',
            isDeleted: true
          }
        }
      ])
    return result
  },
  getAllpractitioners: async function (category, featured, page, searchTerm) {
    let criteria = {
        isPractitioner: true,
        isDeleted: { $ne: true },
        isActive: true,
        isKycVerified: { $ne: false }
      },
      limit = 18
    page = Number(page)
    const User = mongoose.model('User')
    if (category !== 'All') {
      criteria.practitionerCategory = category
    }
    if (featured !== 'all') {
      criteria.isMetaverse = featured
    }

    if (searchTerm === '**') {
      return await User.find(criteria)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    } else {
      return await User.aggregate([
        {
          $search: {
            index: 'pvSearch',
            wildcard: {
              query: searchTerm,
              path: 'name',
              allowAnalyzedField: true
            }
          }
        },
        {
          $match: criteria
        },
        { $sort: { updatedAt: -1 } }
      ])
        .skip((page - 1) * limit)
        .limit(limit)
    }
  },
  getAllInstitutions: async function (category, featured, page, searchTerm) {
    let criteria = {
        isInstitution: true,
        isDeleted: false,
        isActive: true,
        isKycVerified: { $ne: false }
      },
      limit = 18
    page = Number(page)
    const User = mongoose.model('User')
    if (category !== 'All') {
      criteria.practitionerCategory = category
    }
    if (featured !== 'all') {
      criteria.isMetaverse = featured
    }
    return await User.aggregate([
      {
        $search: {
          index: 'pvSearch',
          wildcard: {
            query: searchTerm,
            path: 'name',
            allowAnalyzedField: true
          }
        }
      },
      {
        $match: criteria
      },
      { $sort: { updatedAt: -1 } }
    ])
      .skip((page - 1) * limit)
      .limit(limit)
  },
  listAllpractitioners: async function (isKyc, searchTerm, page) {
    const User = mongoose.model('User'),
      limit = 18
    page = Number(page)
    page = page === 0 ? 0 : page - 1
    let criteria = {
      isDeleted: false,
      isActive: true,
      isPractitioner: true
    }
    if (isKyc !== '*') {
      criteria.isKycVerified = true
    }

    let options = {
      criteria: criteria,
      page,
      sortRule: { updatedAt: -1, isKycVerified: 1 }
    }
    let pipeline = [
      {
        $match: criteria
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          avatar: 1,
          role: 1,
          isEmailVerified: 1,
          isPhoneVerified: 1,
          isActive: 1,
          isBlocked: 1,
          isPractitioner: 1,
          practitionerCategory: 1,
          isKycVerified: 1,
          referalCode: 1,
          isInstitution: 1,
          isDeleted: 1,
          bio: 1,
          description: 1,
          location: 1,
          isMetaverse: 1,
          nonCustodyWallet: 1,
          userName: 1,
          name: 1,
          email: 1,
          phone: 1,
          countryCode: 1,
          custodyWallet: 1
        }
      },

      {
        $facet: {
          users: [{ $skip: page * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ]
    if (searchTerm !== '') {
      pipeline.unshift({
        $search: {
          index: 'practitioner',
          autocomplete: {
            path: 'name',
            query: searchTerm,
            fuzzy: {
              maxEdits: 1
            }
          }
        }
      })
    }
    return await User.aggregate(pipeline)
  },
  updateKYCStatus: async function (userId, status) {
    const User = mongoose.model('User')
    try {
      return await User.findOneAndUpdate(
        { _id: userId },
        { $set: { isKycVerified: status } },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  listAllpractitionersWithoutPagination: async function () {
    const User = mongoose.model('User')
    try {
      return await User.find(
        { isPractitioner: true },
        {
          userName: 1,
          name: 1,
          email: 1,
          bio: 1,
          description: 1,
          practitionerCategory: 1,
          phone: 1,
          countryCode: 1,
          avatar: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
          isKycVerified: 1
        }
      )
        .sort({ updatedAt: -1 })
        .lean()
        .exec()
    } catch (error) {}
  },
  getCorpUser: async function (corpId, page) {
    const User = mongoose.model('User')
    try {
      let options = {}
      options.criteria = { corpId }
      options.page = page
      return await User.listForPagination(options)
    } catch (error) {
      throw error
    }
  },
  getCorpActivityDetails: async function (userId, nftId) {
    try {
      const User = mongoose.model('User')
      return await User.aggregate([
        {
          $match: {
            _id: ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'assets',
            let: { assetId: ObjectId(nftId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$assetId']
                  }
                }
              }
            ],
            as: 'asset'
          }
        },
        {
          $lookup: {
            from: 'activityrewards',
            localField: '_id',
            foreignField: 'user',
            as: 'rewards'
          }
        },
        {
          $lookup: {
            from: 'payments',
            let: { assetId: ObjectId(nftId) },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$asset', '$$assetId']
                      }
                    },
                    {
                      $expr: {
                        $eq: ['$transactionType', 'repairSneaker']
                      }
                    }
                  ]
                }
              }
            ],
            as: 'repairs'
          }
        },
        {
          $lookup: {
            from: 'activities', // Assuming the collection name is 'activities'
            localField: '_id',
            foreignField: 'user',
            as: 'activities'
          }
        },
        {
          $group: {
            _id: null,
            totalDistance: { $sum: '$activities.distance' },
            totalPoints: { $sum: '$activities.point' },
            userDoc: { $first: '$$ROOT' } // Preserve the user document
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$userDoc',
                { totalDistance: '$totalDistance', totalPoints: '$totalPoints' }
              ]
            }
          }
        },
        {
          $project: {
            email: 1,
            userName: 1,
            fullName: '$name',
            tokenId: { $arrayElemAt: ['$asset.tokenId', 0] },
            name: { $arrayElemAt: ['$asset.name', 0] },
            category: { $arrayElemAt: ['$asset.category', 0] },
            efficiencyIndex: { $arrayElemAt: ['$asset.efficiencyIndex', 0] },
            image: { $arrayElemAt: ['$asset.asset', 0] },
            thumbnail: { $arrayElemAt: ['$asset.thumbnail', 0] },
            price: { $arrayElemAt: ['$asset.price', 0] },
            sneakerLife: { $arrayElemAt: ['$asset.sneakerLife', 0] },
            earnings: '$rewards',
            totalDistance: { $sum: '$activities.distance' },
            totalPoints: { $sum: '$activities.point' },
            repairs: '$repairs'
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  searchCorpUser: async function (args) {
    try {
      const User = mongoose.model('User')
      let { searchTerm, corpId, page } = args,
        limit = 18
      page = Number(page)
      page = page === 0 ? 0 : page - 1

      if (searchTerm !== '') {
        return await User.aggregate([
          {
            $search: {
              index: 'default',
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: searchTerm,
                      path: 'email',
                      fuzzy: {
                        maxEdits: 1,
                        prefixLength: 1,
                        maxExpansions: 256
                      }
                    }
                  },
                  {
                    autocomplete: {
                      query: searchTerm,
                      path: 'name',
                      fuzzy: {
                        maxEdits: 1,
                        prefixLength: 1,
                        maxExpansions: 256
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            $match: {
              corpId: corpId
            }
          },
          {
            $lookup: {
              from: 'assets',
              localField: 'custodyWallet.wallet',
              foreignField: 'owner',
              as: 'assets'
            }
          },
          {
            $lookup: {
              from: 'activityrewards',
              localField: '_id',
              foreignField: 'user',
              as: 'rewards'
            }
          },
          {
            $lookup: {
              from: 'activities',
              localField: '_id',
              foreignField: 'user',
              as: 'activities'
            }
          },
          {
            $group: {
              _id: '$_id',
              tokenId: {
                $first: { $arrayElemAt: ['$assets.tokenId', 0] }
              },
              nftId: {
                $first: { $arrayElemAt: ['$assets._id', 0] }
              },
              name: {
                $first: { $arrayElemAt: ['$assets.name', 0] }
              },
              category: {
                $first: { $arrayElemAt: ['$assets.category', 0] }
              },
              efficiencyIndex: {
                $first: { $arrayElemAt: ['$assets.efficiencyIndex', 0] }
              },
              image: {
                $first: { $arrayElemAt: ['$assets.asset', 0] }
              },
              fullName: { $first: '$name' },
              userName: { $first: '$userName' },
              email: { $first: '$email' },
              totalLimos: {
                $sum: '$rewards.limos'
              },
              totalDistance: {
                $sum: '$activities.distance'
              },
              totalPoints: {
                $sum: '$activities.point'
              }
            }
          }
        ])
          .skip(page * limit)
          .limit(limit)
      } else {
        return []
      }
    } catch (error) {
      throw error
    }
  },
  setDefaultWearableNFT: async function (userId, nftId) {
    try {
      const User = mongoose.model('User')
      return await User.findOneAndUpdate(
        { _id: ObjectId(userId) },
        {
          $set: {
            wearableNFT: nftId
          }
        },
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  updateKycReferenceId: async function (id, kycReferenceId) {
    const User = mongoose.model('User')
    return User.findByIdAndUpdate(
      id,
      {
        $set: {
          kycReferenceId: kycReferenceId
        }
      },
      {
        new: true
      }
    )
  },
  updateKycDocVerificationStatus: async function (id, kycStatus) {
    const User = mongoose.model('User')
    return await User.findByIdAndUpdate(
      id,
      {
        $set: {
          kycStatus: kycStatus
        }
      },
      {
        new: true
      }
    )
  },
  getFiveLevelReferral: async function (user) {
    try {
      const User = mongoose.model('User')
    } catch (error) {
      throw error
    }
  },
  addParent: async function (userId, parent) {
    try {
      const user = mongoose.model('User')
      return await user.findOneAndUpdate(
        { _id: ObjectId(userId) },
        {
          $set: {
            referredBy: parent
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  getSalesByReferalCode: async function (userId, startDate, endDate) {
    try {
      const user = mongoose.model('User')
      return await user.aggregate([
        {
          $match: {
            _id: userId
          }
        },
        {
          $lookup: {
            from: 'nftpurchases',
            let: { referralCode: '$referalCode' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$referralCode', '$$referralCode']
                  }
                }
              },
              {
                $lookup: {
                  from: 'assets',
                  localField: 'nft',
                  foreignField: '_id',
                  as: 'nftDetails'
                }
              },
              {
                $group: {
                  _id: null,
                  totalNFTPrice: {
                    $sum: {
                      $toDouble: { $arrayElemAt: ['$nftDetails.price', 0] }
                    }
                  }
                }
              }
            ],
            as: 'nftpurchases'
          }
        },
        {
          $lookup: {
            from: 'directstakes',
            let: { referralCode: '$referalCode' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$referralCode', '$$referralCode']
                  }
                }
              }
            ],
            as: 'stakes'
          }
        },
        {
          $project: {
            _id: 0,
            totalStakes: {
              $ifNull: [
                { $sum: '$stakes.stake' },
                0 // Default value if totalStakes is null
              ]
            },
            totalNftSale: {
              $ifNull: [
                { $arrayElemAt: ['$nftpurchases.totalNFTPrice', 0] },
                0 // Default value if totalNftSale is null
              ]
            }
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  b2bReferrals: async function (args) {
    try {
      let { affiliateCode, corpId } = args
      const user = mongoose.model('User')
      return await user.find(
        { affiliateCode: affiliateCode, corpId: corpId },
        { email: 1, name: 1 }
      )
    } catch (error) {
      throw error
    }
  },
  updateStakeClub: async function (args) {
    try {
      let { email, stakeClub } = args
      const user = mongoose.model('User')
      return await user.findOneAndUpdate(
        { email: email },
        { $set: { stakeClub: stakeClub } },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  addInstructor: async function (email, userName) {
    try {
      const User = mongoose.model('User'),
        userModel = User()
      userModel.email = email
      userModel.role = 'instructor'
      userModel.userName = userName
      return userModel.save()
    } catch (error) {
      throw error
    }
  },
  upgradeAccount: async function (args) {
    try {
      const User = mongoose.model('User'),
        { userId, category, subCategory } = args
      return await User.findOneAndUpdate(
        { _id: userId, isPractitioner: false },
        {
          $set: {
            isPractitioner: true,
            practitionerCategory: category,
            subCategory: subCategory,
            role: 'instructor'
          }
        },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  getCoaches: async function (page, category) {
    try {
      const User = mongoose.model('User')
      let options = {
        criteria: {
          isPractitioner: true,
          role: 'instructor',
          isDeleted: false,
          isActive: true,
          isKycVerified: true
        },
        page: page,
        select:
          'name userName email country coverPicture avatar role isKycVerified trainerizeId category subCategory'
      }

      if (category !== 'All') {
        options.criteria.category = category
      }
      return await User.listForPagination(options)
    } catch (error) {
      throw error
    }
  },
  addTrainerizeId: async function (args) {
    try {
      const User = mongoose.model('User')
      const { userId, trainerizeId } = args
      return await User.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: { trainerizeId: trainerizeId } },
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  addLimocardPlanPurchaseDetails:async function (args) {
    try {
      const User = mongoose.model('User')
      const {userId,planId, planName,orderId,status} = args
      return await User.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: { "limoCardMeta.planPurchase": {planId:planId,planName:planName,orderId:orderId,status:status} } },
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  updateLimocardPlanPurchaseDetails:async function(args){
    try {
      const User = mongoose.model('User')
      const {userId,orderId,status} = args
      return await User.findOneAndUpdate(
        { _id: ObjectId(userId),'limoCardMeta.planPurchase.orderId':orderId },
        { $set: { "limoCardMeta.planPurchase.status":status } },
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  getLimoCardPurchaseStatus:async function(args){
    try {
      const User = mongoose.model('User')
      const {userId} = args
      return await User.findOne(
        { _id: ObjectId(userId) },{'limoCardMeta.planPurchase':1 }
      )
    } catch (error) {
      throw error
    }
  },
  getInstructorDetails: async function (userId) {
    try {
      const User = mongoose.model('User')
      return await User.findOne(
        { _id: ObjectId(userId) },
        {
          name: 1,
          email: 1,
          role: 1,
          userName: 1,
          avatar: 1,
          coverPicture: 1,
          location: 11,
          isKycVerified: 1,
          category: 1,
          subCategory: 1,
          languages: 1
        }
      )
    } catch (error) {
      throw error
    }
  },
  search: async function (searchTerm) {
    try {
      const User = mongoose.model('User')
      return User.aggregate([
        {
          $match: {
            name: { $regex: searchTerm, $options: 'i' },
            isPractitioner: true,
            isKycVerified: true
          }
        },
        {
          $unionWith: {
            coll: 'courses',
            pipeline: [
              {
                $match: {
                  title: { $regex: searchTerm, $options: 'i' }
                }
              }
            ]
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  saveAuth: async function (user, playerId) {
    try {
      const userModel = mongoose.model('User')
      return await userModel.findOneAndUpdate(
        {
          _id: ObjectId(user)
        },
        {
          $set: {
            notificationId: playerId
          }
        },
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  updateCredits: async function (user, credits) {
    try {
      const userModel = mongoose.model('User')
      return await userModel.findOneAndUpdate(
        {
          _id: ObjectId(user)
        },
        [
          {
            $set: {
              credits: { $ifNull: ['$credits', 0] }
            }
          },
          {
            $set: {
              credits: { $add: ['$credits', credits] }
            }
          }
        ],
        {
          new: true
        }
      )
    } catch (error) {
      throw error
    }
  },
  getUnSubscribedUsers: async function () {
    try {
      const User = mongoose.model('User')
      return User.aggregate([
        {
          $match: {
            $and: [
              {
                notificationId: {
                  $exists: true
                }
              },
              {
                $expr: {
                  $ne: ['$notificationId', null]
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'subscriptions',
            let: { user: '$_id' },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$user', '$$user']
                      }
                    },
                    {
                      $expr: {
                        $eq: ['$status', 'active']
                      }
                    }
                  ]
                }
              }
            ],
            as: 'activeSubscriptions'
          }
        },
        {
          $match: {
            activeSubscriptions: { $eq: [] }
          }
        },
        {
          $project: {
            _id: 0,
            notificationId: 1,
            name: 1,
            userName: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  },
  getSubscribedUsers: async function () {
    try {
      const User = mongoose.model('User')
      return User.aggregate([
        {
          $match: {
            $and: [
              {
                notificationId: {
                  $exists: true
                }
              },
              {
                $expr: {
                  $ne: ['$notificationId', null]
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'subscriptions',
            let: { user: '$_id' },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$user', '$$user']
                      }
                    },
                    {
                      $expr: {
                        $eq: ['$status', 'active']
                      }
                    }
                  ]
                }
              }
            ],
            as: 'activeSubscriptions'
          }
        },
        {
          $match: {
            activeSubscriptions: { $ne: [] }
          }
        },
        {
          $project: {
            _id: 0,
            notificationId: 1,
            name: 1,
            userName: 1,
            activeSubscriptions: 1
          }
        }
      ])
    } catch (error) {
      throw error
    }
  }
}

UserSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'name userName email createdAt'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },
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

UserSchema.index(
  {
    email: 1
  },
  { email: 1, userName: 1 },
  { userName: 1 },
  { _id: 1, authToken: 1 },
  { email: 1, isEmailVerified: 1 },
  { _id: 1, 'nonCustodyWallet.wallet': 1, 'nonCustodyWallet.isVerified': 1 },
  {
    isDeleted: 1,
    'nonCustodyWallet.wallet': 1,
    'nonCustodyWallet.isVerified': 1
  },
  { _id: 1, 'nonCustodyWallet.isVerified': 1 },
  { referralCode: 1 },
  {
    isPractitioner: 1,
    isDeleted: 1,
    isActive: 1,
    isKycVerified: 1
  },
  {
    isPractitioner: 1,
    isDeleted: 1,
    isActive: 1,
    isKycVerified: 1,
    practitionerCategory: 1,
    isMetaverse: 1
  },
  {
    isInstitution: 1,
    isDeleted: 1,
    isActive: 1,
    isKycVerified: 1
  },
  {
    isInstitution: 1,
    isDeleted: 1,
    isActive: 1,
    isKycVerified: 1,
    practitionerCategory: 1,
    isMetaverse: 1
  },
  { isDeleted: 1, isActive: 1, isPractitioner: 1, isKycVerified: 1 },
  { isPractitioner: 1 },
  { corpId: 1 },
  { name: 'text' },
  { bio: 'text' },
  { location: 'text' },
  { userName: 'text' },
  { email: 'text', name: 'text' },
  { corpId: 1, email: 1, name: 1 },
  { affiliateCode: 1, corpId: 1 },
  {
    notificationId: 1,
    _id: 1,
    name: 1,
    userName: 1
  }
)

module.exports = mongoose.model('User', UserSchema)
