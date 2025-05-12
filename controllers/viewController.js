import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.render('overview', {
    title: 'Overview',
    tours,
  });
});

export const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) return next(new AppError('There is no tour with that name', 404));

  res.render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

export const getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Get your login account',
  });
});

export const getSignUpForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up your  account',
  });
});

export const getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
});

export const getMyTour = catchAsync(async (req, res) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour._id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
