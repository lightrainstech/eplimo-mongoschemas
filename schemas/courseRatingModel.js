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
      max: 5,
      required: true,
      default: 1
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
    return await Rating.aggregate([
      {
        $match: { course: ObjectId(courseId) }
      },
      {
        $facet: {
          ratings: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ],
          stats: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: { $ifNull: ['$rating', 0] } },
                totalDocs: { $sum: 1 }
              }
            }
          ],
          documents: [
            {
              $match: { course: ObjectId(courseId) }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'submittedUser',
                foreignField: '_id',
                as: 'submittedUser'
              }
            },
            {
              $unwind: '$submittedUser'
            },
            {
              $project: {
                _id: 1,
                course: 1,
                rating: 1,
                review: 1,
                submittedUser: '$submittedUser.email',
                isFavourite: 1,
                createdAt: 1,
                updatedAt: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          ratings: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: 'rating',
              in: {
                rating: '$$rating',
                count: {
                  $let: {
                    vars: {
                      ratingObj: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$ratings',
                              as: 'ratingObj',
                              cond: { $eq: ['$$ratingObj._id', '$$rating'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$ratingObj.count', 0] }
                  }
                }
              }
            }
          },
          averageRating: {
            $arrayElemAt: [{ $ifNull: ['$stats.averageRating', 0] }, 0]
          },
          totalDocs: { $arrayElemAt: ['$stats.totalDocs', 0] },
          documents: '$documents'
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
      }).populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name email'
        }
      })
    } catch (error) {
      throw error
    }
  }
}

module.exports = mongoose.model('Rating', courseRatingSchema)
