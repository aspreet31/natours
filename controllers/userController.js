import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} from './handlerFactory.js';
import { pipeline } from 'stream';
import multer from 'multer';
import sharp from 'sharp';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//Multer middleware
//1. Storage

//DISC STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user.id}${Date.now()}.${ext}`;
//     cb(null, fileName);
//   },
// });
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

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

export const createUser = createOne(User);

export const deleteUser = deleteOne(User);

export const updateUser = updateOne(User);

export const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

export const userPhotoUpload = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

export const updateMe = catchAsync(async (req, res, next) => {
  //1)Not for password
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('Not for password updates'));
  }
  //2)Filtered Object
  const filteredObj = filterObj(req.body, 'name', 'email');
  if (req.file) filteredObj.photo = req.file.filename;

  //3)Update User
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
