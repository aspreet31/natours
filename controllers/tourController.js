import Tour from '../models/tourModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} from './handlerFactory.js';
import multer from 'multer';
import sharp from 'sharp';

//MEMORY STORAGE
const multerStorage = multer.memoryStorage();
//2.) File Filter
const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    cb(new AppError('Not a image, Please upload image only', 400), false);
  } else {
    cb(null, true);
  }
};
//3.)Multer middleware[Upload]
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//For multiple fields with multiple uploads
//Both fields will store in array
export const uploadTourImages = catchAsync(async (req, res, next) => {
  if (!req.body.imageCover || !req.body.images) return next();
  upload.fields([
    {
      name: 'imageCover',
      maxCount: 1,
    },
    {
      name: 'images',
      maxCount: 3,
    },
  ]);
});

//For Single field with multiple images upload
// upload.array('images');  ---req.files
// upload.single('imageCover', 1);---req.file
//

//Resize Tour images

export const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.body.imageCover || !req.body.images) return next();
  if (!req.files.imageCover || !req.files.images) return next();
  //FOR IMAGE COVER - SINGLE
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}--cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //FOR IMAGES - MULTIPLE
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}--${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    }),
  );

  next();
});

//MIDDLEWARE
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//ROUTES HANDLERS
export const getAllTours = getAll(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });

export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

export const toursWithin = catchAsync(async (req, res, next) => {
  //tours-within/distance/:distance/center/:latlng/unit/:unit
  //tours-within/distance/300/center/-40,40/unit/mi
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //GEOSPETIAL OPERATION TAKES RADIUS IN RADIANS
  //CALCULATE -> DISTANCE/RADIUS OF EARTH
  //IF DISTANCE IN  MILES USE 3963.2 -> EARTH RADIUS & KILOMETERS -> 6378.1
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    return next(
      new AppError('Please provide latitude & longtitude in format lat,lng'),
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//For cal. we prefer aggregation pipelines
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // MongoDB gives distance in meters by default
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //or kilometers
  if (!lat || !lng)
    return next(
      new AppError('Please provide latitude & longtitude in format lat,lng'),
    );
  const distances = await Tour.aggregate([
    {
      //Should be 1 stage
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
