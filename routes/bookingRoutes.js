import express from 'express';
import {
  createBooking,
  deleteBooking,
  getAllBooking,
  getBooking,
  getCheckoutSession,
  updateBooking,
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const bookingRouter = express.Router();

bookingRouter.use(protect);
bookingRouter.route('/checkout-session/:tourId').get(getCheckoutSession);

bookingRouter.use(restrictTo('admin', 'lead-guide'));
bookingRouter.route('/').get(getAllBooking).post(createBooking);

bookingRouter
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default bookingRouter;
