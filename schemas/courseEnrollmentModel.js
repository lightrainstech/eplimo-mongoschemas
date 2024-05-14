'use strict'

// External Dependencies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId //ObjectId

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledCourse: {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
      sections: [
        {
          sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
            required: true
          },
          videos: [
            {
              videoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
                required: true
              },
              isComplete: {
                type: Boolean,
                default: false
              }
            }
          ]
        }
      ]
    }
  },
  {
    timestamps: true
  }
)

enrollmentSchema.methods = {
  getEnrollment: async function (courseId, userId) {
    const Enrollment = mongoose.model('Enrollment')
    let query = {
      'enrolledCourse.courseId': new ObjectId(courseId),
      user: new ObjectId(userId)
    }
    const options = {
      criteria: query
    }
    return Enrollment.load(options)
  },
  markVideoAsComplete: async function (
    enrollmentId,
    courseId,
    userId,
    sectionId,
    videoId,
    status
  ) {
    const Enrollment = mongoose.model('Enrollment')
    return Enrollment.findOneAndUpdate(
      {
        _id: new ObjectId(enrollmentId),
        user: new ObjectId(userId),
        'enrolledCourse.courseId': new ObjectId(courseId),
        'enrolledCourse.sections.sectionId': new ObjectId(sectionId),
        'enrolledCourse.sections.videos.videoId': new ObjectId(videoId)
      },
      {
        $set: {
          'enrolledCourse.sections.$.videos.$[video].isComplete': status
        }
      },
      {
        arrayFilters: [
          {
            'video.videoId': new ObjectId(videoId)
          }
        ],
        new: true
      }
    ).select('-enrolledCourse.sections._id -enrolledCourse.sections.videos._id')
  },
  ListEnrollments: async function (userId, page, sortBy, sortOrder) {
    const Enrollment = mongoose.model('Enrollment')
    let query = {
      user: new ObjectId(userId)
    }

    const sortOptions = {}
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
    } else {
      sortOptions.createdAt = -1
    }

    const options = {
      criteria: query,
      page: page,
      sort: sortOptions,
      limit: 12,
      populate: {
        path: 'enrolledCourse.courseId',
        select: '_id title description instructor image',
        populate: {
          path: 'instructor',
          select: 'name email userName'
        }
      }
    }
    return Enrollment.list(options)
  }
}

enrollmentSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select ||
      '-enrolledCourse.sections._id -enrolledCourse.sections.videos._id'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },
  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page - 1
    const limit = parseInt(options.limit) || 12
    const select =
      options.select || '-enrolledCourse.sections -enrolledCourse.sections'
    return this.find(criteria)
      .select(select)
      .populate(options.populate)
      .sort(options.sort || { createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec()
  }
}

module.exports = mongoose.model('Enrollment', enrollmentSchema)
