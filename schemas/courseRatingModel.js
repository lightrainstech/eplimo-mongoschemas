'use strict'

// External Dependencies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const courseRatingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: true
    },
    submittedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

courseRatingSchema.methods = {
  getCourseRatings: async function (courseId) {
    const Rating = mongoose.model('Rating')
    return Rating.aggregate([
      {
        $match: {
          course: new ObjectId(courseId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedUser',
          foreignField: '_id',
          as: 'submittedUserDetails'
        }
      },
      {
        $unwind: {
          path: '$submittedUserDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$course',
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratings: { $push: '$$ROOT' }
        }
      },
      {
        $unwind: {
          path: '$ratings',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'ratings.createdAt': -1
        }
      },
      {
        $group: {
          _id: '$_id',
          totalRatings: { $first: '$totalRatings' },
          averageRating: { $first: '$averageRating' },
          ratings: { $push: '$ratings' }
        }
      },
      {
        $project: {
          _id: 1,
          totalRatings: 1,
          averageRating: 1,
          'ratings._id': 1,
          'ratings.rating': 1,
          'ratings.review': 1,
          'ratings.createdAt': 1,
          'ratings.updatedAt': 1,
          'ratings.submittedUserDetails._id': 1,
          'ratings.submittedUserDetails.name': 1,
          'ratings.submittedUserDetails.email': 1
        }
      }
    ])
  }
}

module.exports = mongoose.model('Rating', courseRatingSchema)
