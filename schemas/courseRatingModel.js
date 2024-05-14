'use strict'

const { findOne } = require('dbschemas/schemas/courseModel')
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
      min: 1,
      max: 5
    },
    review: {
      type: String
    },
    submittedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isFavourite: {
      type: Boolean,
      default: false
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
          totalReviews: { $sum: 1 },
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
          totalReviews: { $first: '$totalReviews' },
          averageRating: { $first: '$averageRating' },
          ratings: { $push: '$ratings' }
        }
      },
      {
        $project: {
          _id: 1,
          totalReviews: 1,
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
      },
      {
        $unwind: {
          path: '$ratings',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$ratings.rating', // Group by rating value
          count: { $sum: 1 }, // Count the occurrences of each rating value
          data: { $push: '$$ROOT' } // Preserve all data for each rating value
        }
      },
      {
        $sort: {
          _id: 1 // Sort by rating value in ascending order
        }
      },
      {
        $group: {
          _id: null,
          ratingsCount: {
            $push: {
              key: { $toString: '$_id' },
              value: '$count'
            }
          },
          data: { $push: '$data' }
        }
      },
      {
        $project: {
          _id: 0,
          ratingsCount: 1,
          data: {
            $reduce: {
              input: '$data',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          } // Flatten the data array
        }
      }
    ])
  },
  favouriteCourse: async function (args) {
    try {
      const Rating = mongoose.model('Rating')
      const { courseId, userId, isFavourite } = args
      return await Rating.findOneAndUpdate(
        {
          course: courseId,
          submittedUser: userId
        },
        {
          $set: {
            isFavourite: isFavourite
          }
        },
        { new: true, upsert: true }
      )
    } catch (error) {
      throw error
    }
  },
  addReview: async function (args) {
    try {
      const Rating = mongoose.model('Rating')
      const { userId, courseId, comment, rating } = args
      let data = await Rating.findOne({
        course: ObjectId(courseId),
        submittedUser: userId,
        isFavourite: { $exists: true },
        review: { $exists: false }
      })
      if (data) {
        return await Rating.findOneAndUpdate(
          { _id: data._id },
          { $set: { review: comment, rating: rating } },
          { new: true }
        )
      } else {
        const ratingModel = new Rating()
        ratingModel.course = courseId
        ratingModel.submittedUser = userId
        ratingModel.review = comment
        ratingModel.rating = rating
        return await ratingModel.save()
      }
    } catch (error) {
      throw error
    }
  },
  getReview: async function (courseId) {
    try {
      const Rating = mongoose.model('Rating')
      return await Rating.find({
        course: ObjectId(courseId),
        review: { $exists: true }
      }).populate({ path: 'submittedUser', select: 'name email userId' })
    } catch (error) {
      throw error
    }
  },
  courseFavourite: async function (args) {
    try {
      const Rating = mongoose.model('Rating'),
        { courseId, userId } = args
      return await Rating.findOne(
        { course: courseId, submittedUser: userId },
        { isFavourite: 1 }
      )
    } catch (error) {
      throw error
    }
  },
  getFavouriteCourses: async function (args) {
    try {
      const Rating = mongoose.model('Rating'),
        { userId } = args
      return await Rating.find({
        submittedUser: userId,
        isFavourite: true
      }).populate({ path: 'course' })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('Rating', courseRatingSchema)
