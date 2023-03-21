const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId
const crypto = require('crypto')
const { v5 } = require('uuid')

const socialSchema = {
  url: String
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
    role: {
      type: String,
      required: true,
      enum: ['lpo', 'user'],
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
        'Ayurveda Centre',
        'Fitness Center',
        'Health Food',
        'Health tech products',
        'Hospitals/Clinics',
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
      type: String,
      enum: [
        'All',
        'Yoga',
        'Meditation',
        'Diet/Nutrition',
        'Fitness',
        'Zumba',
        'Naturopathy',
        'Chinese medicine',
        'Allopathy',
        'Ayurveda',
        'Homeopathy',
        'Psychology',
        'Physiotherapy',
        'Life coaching',
        'NA'
      ],
      default: 'NA'
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
        isKycVerified: 1
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
    let result = await User.find(query).limit(1).exec()
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
        select: 'email, custodyWallet'
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
          nonCustodyWallet: {
            $elemMatch: { wallet: wallet, isVerified: true }
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
            createdAt: 1
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
  findUserByReferalCode: async function (referralCode) {
    const User = mongoose.model('User'),
      result = User.findOne({ referalCode: referralCode }).lean().exec()
    return result
  },
  updateReferalCode: async function (userId, referalCode) {
    const User = mongoose.model('User'),
      result = await User.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { referalCode },
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
        isDeleted: false,
        isActive: true,
        isKycVerified: true
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
  getAllInstitutions: async function (category, featured, page, searchTerm) {
    let criteria = {
        isInstitution: true,
        isDeleted: false,
        isActive: true,
        isKycVerified: true
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
          $unwind: {
            path: '$asset',
            preserveNullAndEmptyArrays: false
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
          $unwind: {
            path: '$rewards',
            preserveNullAndEmptyArrays: false
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
          $group: {
            _id: '$_id',
            email: {
              $first: '$email'
            },
            userName: {
              $first: '$userName'
            },
            fullName: {
              $first: '$name'
            },
            tokenId: {
              $first: '$asset.tokenId'
            },
            name: {
              $first: '$asset.name'
            },
            category: {
              $first: '$asset.category'
            },
            efficiencyIndex: {
              $first: '$asset.efficiencyIndex'
            },
            image: {
              $first: '$asset.asset'
            },
            thumbnail: {
              $first: '$asset.thumbnail'
            },
            price: {
              $first: '$asset.price'
            },
            sneakerLife: {
              $first: '$asset.sneakerLife'
            },
            earnings: {
              $push: '$rewards'
            },
            totalDistance: {
              $sum: '$activities.distance'
            },
            totalPoints: {
              $sum: '$activities.point'
            },
            repairs: {
              $first: '$repairs'
            }
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
          { $sort: { updatedAt: -1 } },

          {
            $project: {
              name: 1,
              'custodyWallet.wallet': 1,
              email: 1,
              userName: 1
            }
          },
          {
            $lookup: {
              from: 'assets',
              localField: 'custodyWallet.wallet',
              foreignField: 'owner',
              as: 'asset'
            }
          },
          {
            $unwind: {
              path: '$asset',
              preserveNullAndEmptyArrays: false
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
            $unwind: {
              path: '$rewards',
              preserveNullAndEmptyArrays: false
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
            $unwind: {
              path: '$activities',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $group: {
              _id: '$_id',
              tokenId: {
                $first: '$asset.tokenId'
              },
              nftId: {
                $first: '$asset._id'
              },
              name: {
                $first: '$asset.name'
              },
              category: {
                $first: '$asset.category'
              },
              efficiencyIndex: {
                $first: '$asset.efficiencyIndex'
              },
              image: {
                $first: '$asset.asset'
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
    referalCode: 1
  },
  {
    email: 1
  },
  { authToken: 1 },
  { userName: 1 },
  { email: 1, isEmailVerified: 1 },
  { email: 1, userName: 1 },
  { category: 1, practitionerCategory: 1, isMetaverse: 1 },
  { name: 'text' },
  { bio: 'text' },
  { location: 'text' },
  { userName: 'text' },
  { isDeleted: 1, isActive: 1, isPractitioner: 1 },
  {
    isPractitioner: 1,
    isDeleted: 1,
    isActive: 1,
    isKycVerified: 1,
    'avatar.path': 1
  },
  { email: 'text', name: 'text' }
)

module.exports = mongoose.model('User', UserSchema)
