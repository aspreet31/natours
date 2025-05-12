import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  aliasTopTours,
  getTour,
  getAllTours,
  getTourStats,
  getMonthlyPlan,
  createTour,
  updateTour,
  deleteTour,
  toursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} from '../controllers/tourController.js';
import reviewsRouter from './reviewRoutes.js';

const toursRouter = express.Router();

//PARAM MIDDLEWARE
// toursRouter.param('id', tourController.checkID);
//ROUTES
//Redirecting to reviewRouter
toursRouter.use('/:tourId/reviews', reviewsRouter);
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

toursRouter.route('/tour-stats').get(getTourStats);
toursRouter
  .route('/monthly-plan/:year')
  .get(restrictTo('admin', 'lead-guide'), getMonthlyPlan);

//STANDARD WAY OF URLS
//tours-within/distance/:distance/center/:latlng/unit/:unit
//tours-within/distance/300/center/-40,42/unit/mi
//READIABLITY DECREASES
//tours-within?distance=200&center=-43,40&unit=mi
toursRouter
  .route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
  .get(toursWithin);

toursRouter.route('/distances/:latlng/unit/:unit').get(getDistances);
//GET ALL TOURS
/**
 * @openapi
 * /api/v1/tours:
 *   get:
 *     summary: Get all tours
 *     tags:
 *        - Tours
 *     responses:
 *       200:
 *         description: Retrieval of tours
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
toursRouter.route('/').get(getAllTours).post(createTour);
//GET  TOUR BY ID
/**
 * @openapi
 * /api/v1/tours/{id}:
 *   get:
 *     summary: Get a tour by ID
 *     tags:
 *        - Tours
 *     parameters:
 *       - in : path
 *         name : id
 *         required : true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Tour get
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
//CREATE TOUR
/**
 * @openapi
 * /api/v1/tours:
 *   post:
 *     summary: Create tour
 *     tags:
 *       - Tours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - duration
 *               - maxGroupSize
 *               - difficulty
 *               - price
 *               - summary
 *               - imageCover
 *             properties:
 *               name:
 *                 type: string
 *                 example: "The Forest Hiker"
 *               duration:
 *                 type: number
 *                 example: 7
 *               maxGroupSize:
 *                 type: number
 *                 example: 15
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, difficult]
 *                 example: medium
 *               price:
 *                 type: number
 *                 example: 497
 *               priceDiscount:
 *                 type: number
 *                 example: 100
 *               summary:
 *                 type: string
 *                 example: "Breathtaking hike through the Canadian forests"
 *               description:
 *                 type: string
 *                 example: "You’ll hike through dense forests and beautiful landscapes."
 *               imageCover:
 *                 type: string
 *                 example: "tour-1-cover.jpg"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tour-1-1.jpg", "tour-1-2.jpg"]
 *               startDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2025-05-01", "2025-06-01"]
 *               startLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     example: "Starting point of the tour"
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     default: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [-122.5, 37.7]
 *                   address:
 *                     type: string
 *                     example: "123 Forest Road"
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [Point]
 *                       default: Point
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [-122.6, 37.8]
 *                     address:
 *                       type: string
 *                     description:
 *                       type: string
 *                     day:
 *                       type: integer
 *               guides:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: string
 *     responses:
 *       201:
 *         description: Tour created successfully
 *       409:
 *         description: Conflict (e.g., duplicate tour name)
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */

//UPDATE TOUR BY ID
/**
 * @openapi
 * /api/v1/tours/{id}:
 *   patch:
 *     summary: Tour user
 *     tags:
 *       - Tours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "The Forest Hiker"
 *               duration:
 *                 type: number
 *                 example: 7
 *               maxGroupSize:
 *                 type: number
 *                 example: 15
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, difficult]
 *                 example: medium
 *               price:
 *                 type: number
 *                 example: 497
 *               priceDiscount:
 *                 type: number
 *                 example: 100
 *               summary:
 *                 type: string
 *                 example: "Breathtaking hike through the Canadian forests"
 *               description:
 *                 type: string
 *                 example: "You’ll hike through dense forests and beautiful landscapes."
 *               imageCover:
 *                 type: string
 *                 example: "tour-1-cover.jpg"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tour-1-1.jpg", "tour-1-2.jpg"]
 *               startDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2025-05-01", "2025-06-01"]
 *               startLocation:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     example: "Starting point of the tour"
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     default: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [-122.5, 37.7]
 *                   address:
 *                     type: string
 *                     example: "123 Forest Road"
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [Point]
 *                       default: Point
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [-122.6, 37.8]
 *                     address:
 *                       type: string
 *                     description:
 *                       type: string
 *                     day:
 *                       type: integer
 *               guides:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: string
 *     responses:
 *       '200':
 *         description: Updated tour successfully
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Not Found
 *       '409':
 *         description: Conflict
 *       '500':
 *         description: Server Error
 */

//DELETE TOUR
/**
 * @openapi
 * /api/v1/tours/{id}:
 *   delete:
 *     summary: Delete tour
 *     tags:
 *        - Tours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in : path
 *         name : id
 *         required : true
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
toursRouter
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

//Use merge params
// toursRouter
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

export default toursRouter;
