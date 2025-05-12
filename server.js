import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import Stripe from 'stripe';

dotenv.config({ path: './config.env' });
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('connection successfully'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
