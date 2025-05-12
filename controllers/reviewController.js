import Review from '../models/reviewModel.js';
import {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} from './handlerFactory.js';

export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//ROUTES

export const getAllReview = getAll(Review);

export const getReview = getOne(Review);

export const createReview = createOne(Review);

export const deleteReview = deleteOne(Review);

export const updateReview = updateOne(Review);
