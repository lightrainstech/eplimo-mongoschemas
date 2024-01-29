'use strict'

// External Dependencies
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const CoursePaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentId: {
      type: String,
      default: null
    },
    paymentMode: {
      type: String,
      enum: ['fireblocks', 'zoksh']
    }
  },
  {
    timestamps: true
  }
)

const limit = 20
CoursePaymentSchema.methods = {
  getPurchaseDetails: async function (courseId, userId, paymentStatus) {
    const Payment = mongoose.model('CoursePayment')
    let query = {
      course: new ObjectId(courseId),
      user: new ObjectId(userId),
      paymentStatus: paymentStatus
    }
    const options = {
      criteria: query
    }
    return Payment.load(options)
  },
  listAllCoursePurchases: async function (courseId, page) {
    const skipDocuments = (page - 1) * limit
    const sortOptions = {
      createdAt: -1
    }
    const pipeline = [
      {
        $match: {
          paymentStatus: 'completed',
          course: new ObjectId(courseId)
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: {
          path: '$courseDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
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
    const Payment = mongoose.model('CoursePayment')
    return Payment.aggregate(pipeline)
  }
}

CoursePaymentSchema.statics = {
  load: function (options, cb) {
    options.select =
      options.select ||
      'user course amount paymentStatus paymentId paymentMode createdAt'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  }
}

module.exports = mongoose.model('CoursePayment', CoursePaymentSchema)
