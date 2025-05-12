import express from 'express';
import {
  createReview,
  setTourUserIds,
  deleteReview,
  getAllReview,
  getReview,
  updateReview,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../controllers/authController.js';
//SET MERGE PARAMS TRUE FOR ACCESS OF PARAMS FROM OTHER ROUTES
const reviewsRouter = express.Router({ mergeParams: true });

// reviewsRouter.use(protect);

// reviewsRouter
//   .route('/')
//   .get(getAllReview)
//   .post(protect, restrictTo('user'), setTourUserIds, createReview);

reviewsRouter.route('/').get(getAllReview).post(createReview);

reviewsRouter
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(deleteReview); //user admin

export default reviewsRouter;
