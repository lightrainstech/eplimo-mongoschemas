'use strict'

// External Dependencies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

// Schema for videos
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    path: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: 'image/jpeg'
    }
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['youtube', 'vimeo']
  },
  duration: {
    type: Number,
    default: 0
  }
})

// Pre-save middleware function
videoSchema.pre('save', function (next) {
  const video = this
  const url = video.url

  const platform = url.includes('youtube')
    ? 'youtube'
    : url.includes('vimeo')
    ? 'vimeo'
    : null
  video.platform = platform
  next()
})

// Schema for sections
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videos: [videoSchema]
})

//schema for user reviews

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 1
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Schema for course
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      path: {
        type: String,
        default: ''
      },
      mimeType: {
        type: String,
        default: 'image/jpeg'
      }
    },
    sections: [sectionSchema],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    offerPrice: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'unpublished'],
      default: 'published'
    },
    category: {
      type: Array,
      default: []
    },
    overview: {
      url: {
        type: String
      },
      platform: {
        type: String,
        enum: ['youtube', 'vimeo']
      }
    },
    courseId: {
      type: String,
      sparse: true,
      unique: true
    },
    reviews: [reviewSchema],
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

courseSchema.pre('findOneAndUpdate', function (next) {
  const courseUpdate = this._update
  const videoUrl =
    courseUpdate?.$set?.['sections.$[section].videos.$[video].url']
  const videos =
    courseUpdate?.$set?.['sections.$.videos'] ||
    courseUpdate?.$set?.['sections.$[section].videos']

  if (videoUrl) {
    const platform = videoUrl.includes('youtube')
      ? 'youtube'
      : videoUrl.includes('vimeo')
      ? 'vimeo'
      : null
    courseUpdate.$set['sections.$[section].videos.$[video].platform'] = platform
  }

  if (videos) {
    for (const video of videos) {
      const url = video.url
      const platform = url.includes('youtube')
        ? 'youtube'
        : url.includes('vimeo')
        ? 'vimeo'
        : null
      video.platform = platform
    }
  }
  next()
})

// Pre-save middleware function
courseSchema.pre('save', function (next) {
  const course = this
  const url = course.overview.url

  const platform = url.includes('youtube')
    ? 'youtube'
    : url.includes('vimeo')
    ? 'vimeo'
    : null
  course.overview.platform = platform
  next()
})

const limit = 20
courseSchema.methods = {
  getCourseById: async function (courseId) {
    const Course = mongoose.model('Course')
    console.log('courseId', courseId)
    let query = {
      $or: [{ _id: new ObjectId(courseId) }, { courseId: courseId }]
    }
    const options = {
      criteria: query,
      populate: 'instructor',
      selectPopulate:
        'name email role userName avatar coverPicture location isKycVerified'
    }
    return Course.load(options)
  },
  getCourseDetails: async function (courseId) {
    const Course = mongoose.model('Course')
    let query = {
      courseId: courseId
    }
    const options = {
      criteria: query,
      populate: 'instructor',
      selectPopulate:
        'name email role userName avatar coverPicture location isKycVerified'
    }
    return Course.load(options)
  },
  getCourseByInstructor: async function (page, instructor) {
    try {
      const Course = mongoose.model('Course')
      const skipDocuments = (page - 1) * limit
      return Course.aggregate([
        {
          $match: {
            instructor: ObjectId(instructor),
            status: 'published'
          }
        },
        {
          $skip: skipDocuments
        },
        {
          $limit: limit
        }
      ])
    } catch (error) {
      throw error
    }
  },
  listAllCourses: async function (
    status,
    sortBy,
    sortOrder,
    page,
    instructor,
    category,
    featured
  ) {
    const Course = mongoose.model('Course')
    const skipDocuments = (page - 1) * limit

    const sortOptions = {}
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
    } else {
      sortOptions.createdAt = -1
    }
    let match = {
      status: status
    }
    if (instructor && instructor != null) {
      match['instructor'] = new ObjectId(instructor)
    }

    if (category && category.length > 0) {
      match['category'] = { $in: category }
    }
    if (featured != null) {
      match['featured'] = featured
    }
    const pipeline = [
      {
        $match: match
      },
      {
        $lookup: {
          from: 'users',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $unwind: {
          path: '$instructor',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          sections: 1,
          instructor: 1,
          price: 1,
          createdAt: 1,
          updatedAt: 1,
          category: 1,
          overview: 1,
          instructor: {
            _id: '$instructor._id',
            name: '$instructor.name',
            email: '$instructor.email',
            role: '$instructor.role'
          }
        }
      },
      {
        $sort: sortOptions
      },
      {
        $skip: skipDocuments
      },
      {
        $limit: limit
      }
    ]
    if (!instructor && instructor === null && category && category.length > 0) {
      pipeline.push(
        {
          $unwind: '$category'
        },
        {
          $group: {
            _id: '$category',
            courses: { $push: '$$ROOT' }
          }
        }
      )
    }
    return Course.aggregate(pipeline)
  },
  updateCourseStatus: async function (courseId, status) {
    const Course = mongoose.model('Course')
    return Course.findByIdAndUpdate(
      courseId,
      {
        $set: {
          status: status
        }
      },
      {
        new: true
      }
    )
  },
  updateOrCreateSection: async function (
    courseId,
    sectionId,
    updatedSectionData
  ) {
    const Course = mongoose.model('Course')
    return Course.findOneAndUpdate(
      {
        _id: new ObjectId(courseId),
        'sections._id': new ObjectId(sectionId)
      },
      {
        $set: {
          'sections.$[section].title': updatedSectionData.title,
          'sections.$[section].description': updatedSectionData.description,
          'sections.$[section].videos': updatedSectionData.videos
        }
      },
      {
        upsert: true,
        new: true,
        arrayFilters: [{ 'section._id': new ObjectId(sectionId) }]
      }
    )
  },
  updateOrAddVideos: async function (
    courseId,
    sectionId,
    videoId,
    updatedVideoData
  ) {
    const Course = mongoose.model('Course')
    return Course.findOneAndUpdate(
      {
        _id: new ObjectId(courseId),
        'sections._id': new ObjectId(sectionId),
        'sections.videos._id': new ObjectId(videoId)
      },
      {
        $set: {
          'sections.$[section].videos.$[video].title': updatedVideoData.title,
          'sections.$[section].videos.$[video].description':
            updatedVideoData.description,
          'sections.$[section].videos.$[video].url': updatedVideoData.url,
          'sections.$[section].videos.$[video].duration':
            updatedVideoData.duration
        }
      },
      {
        arrayFilters: [
          { 'section._id': new ObjectId(sectionId) },
          { 'video._id': new ObjectId(videoId) }
        ],
        upsert: true,
        new: true
      }
    )
  },
  removeSection: async function (courseId, sectionId) {
    const Course = mongoose.model('Course')
    return Course.findByIdAndUpdate(
      { _id: new ObjectId(courseId) },
      {
        $pull: { sections: { _id: new ObjectId(sectionId) } }
      },
      {
        new: true
      }
    )
  },
  removeVideo: async function (courseId, sectionId, videoId) {
    const Course = mongoose.model('Course')
    return Course.findByIdAndUpdate(
      { _id: new ObjectId(courseId), 'sections._id': new ObjectId(sectionId) },
      {
        $pull: { 'sections.$[].videos': { _id: new ObjectId(videoId) } }
      },
      {
        new: true
      }
    )
  },
  getPurchasedCourses: async function (userId, page, sortBy, sortOrder) {
    const Course = mongoose.model('Course')
    const skipDocuments = (page - 1) * limit
    const sortOptions = {}
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
    } else {
      sortOptions['paymentDetails.updatedAt'] = -1
    }

    const pipeline = [
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'course',
          as: 'paymentDetails'
        }
      },
      {
        $unwind: {
          path: '$paymentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'paymentDetails.user': new ObjectId(userId),
          'paymentDetails.status': 'completed',
          status: 'published'
        }
      },
      {
        $sort: sortOptions
      },
      {
        $skip: skipDocuments
      },
      {
        $limit: limit
      }
    ]
    return Course.aggregate(pipeline)
  },
  addReview: async function (args) {
    try {
      const Course = mongoose.model('Course')
      const { userId, courseId, comment, rating } = args
      let review = {
        user: userId,
        rating: rating,
        comment: comment
      }
      return await Course.findOneAndUpdate(
        { courseId },
        { $push: { reviews: review } },
        { new: true }
      )
    } catch (error) {
      throw error
    }
  },
  fetchCourseByGroup: async function (args) {
    try {
      const { category } = args
      const Course = mongoose.model('Course')
      return await Course.find({
        category: { $in: category },
        status: 'published'
      })
    } catch (error) {
      throw error
    }
  },
  getInsrtuctorCourses: async function (instructor) {
    try {
      console.log(instructor)
      const Course = mongoose.model('Course')
      return await Course.find({
        instructor: ObjectId(instructor),
        status: 'published'
      }).populate({
        path: 'instructor',
        select: 'name userName email avatar coverPicture'
      })
    } catch (error) {
      throw error
    }
  }
}

courseSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select ||
      '_id title description sections instructor price status createdAt updatedAt category overview'
    options.populate = options.populate || ''
    return this.findOne(options.criteria)
      .select(options.select)
      .populate(options.populate, options.selectPopulate)
      .lean()
      .exec(cb)
  }
}

module.exports = mongoose.model('Course', courseSchema)
