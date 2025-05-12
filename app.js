//MODULES
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/errorController.js';
import toursRouter from './routes/tourRoutes.js';
import usersRouter from './routes/userRoutes.js';
import reviewsRouter from './routes/reviewRoutes.js';
import { fileURLToPath } from 'ndb/lib/filepath_to_url.js';
import path from 'path';
import viewRouter from './routes/viewRoute.js';
import cookieParser from 'cookie-parser';
import bookingRouter from './routes/bookingRoutes.js';
import compression from 'compression';

const app = express();

//Set Engine
app.set('view engine', 'pug');

const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

//set security http headers
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

//View Folder set
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Natours API',
      version: '1.0.0',
      description: 'API documentation',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//GOBAL MIDDLEWARES
//Set Security http Header
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow your frontend origin
    credentials: true, // Allow cookies if you are sending them
  }),
);

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Requests LIMITS from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests , try again later after an hour',
});
app.use('/api', limiter);

//To access req.body & we can set limit on body sending in req.
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against from XSS site cross scripting attacks
app.use(xss());

//Prevent parameter pollution [duplicates params]
app.use(
  hpp({
    whitelist: [
      'duration', //whiteList->allow for duplicates params
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); //hpp -> ignore first params & use last one

//To compress text on clients req.
app.use(compression());
//Serving Static files
app.use(express.static('public'));

//use OWN ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/bookings', bookingRouter);
//HANDLED ROUTE
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);

export default app;
