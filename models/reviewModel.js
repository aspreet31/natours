import mongoose from 'mongoose';
import Tour from './tourModel.js';
//review / rating / createdAt / ref to tour / ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minlength: [
        10,
        'A review must contains more or equal then 10 characters',
      ],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//ACHIEVING  UNIQUE USER_ID & TOUR_ID THROUGH INDEXING
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //  populate chaining
  //   this.populate({ path: 'tours', select: 'name' }).populate({
  //     path: 'users',
  //     select: 'name photo', //populate means give detail to user from reference id in db
  //   });
  this.populate({
    path: 'user',
    select: 'name photo', //populate means give detail to user from reference id in db
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //nRating - 1 after deleted -> undefined error
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Doesnt apply for update & delete review
//post mid will execute after deleted review - no tour id access
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour); //this.constructor -> accesing curr model after post middleware
});

//SOLUTION : Pass id from pre to post middlware
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne(); //this.r -> holds the actual review document
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour); //this.r.constructor is the Model that created this doc
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
//this.r-> doc , this.r.constructor->model
