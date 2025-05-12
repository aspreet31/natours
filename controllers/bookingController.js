import { stripe } from '../server.js';
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/bookingModel.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

export const getCheckoutSession = catchAsync(async (req, res) => {
  //1) get Booked Tour
  const tour = await Tour.findById(req.params.tourId);
  //2) create checkoutSession
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&&user=${req.user.id}&&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // amount in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  //3)create session as
  res.status(200).json({
    data: session,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { user, tour, price } = req.query;
  if (!user && !tour && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

export const createBooking = createOne(Booking);
export const deleteBooking = deleteOne(Booking);
export const updateBooking = updateOne(Booking);
export const getBooking = getOne(Booking);
export const getAllBooking = getAll(Booking);
