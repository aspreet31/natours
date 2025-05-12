import express from 'express';
import {
  getAccount,
  getLoginForm,
  getMyTour,
  getOverview,
  getSignUpForm,
  getTour,
} from '../controllers/viewController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
import { createBookingCheckout } from '../controllers/bookingController.js';

const viewRouter = express.Router();

viewRouter.get('/', isLoggedIn, createBookingCheckout, getOverview);
viewRouter.get('/tour/:slug', isLoggedIn, getTour);
viewRouter.get('/login', isLoggedIn, getLoginForm);
viewRouter.get('/signUp', getSignUpForm);
viewRouter.get('/me', protect, getAccount);
viewRouter.get('/my-tours', protect, isLoggedIn, getMyTour);
export default viewRouter;
