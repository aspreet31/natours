import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './../models/userModel.js';
import { promisify } from 'util';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true, //so that cookie can only read , not change
};
// if (process.env.NODE_ENV === 'PRODUCTION') cookieOptions.secure = true; //to run on secure connections like https

const createSendToken = (statusCode, user, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  //remove password from db
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(201, newUser, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2)check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3)If everything okay then send token to client
  createSendToken(200, user, res);
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), //10secs
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

export const protect = catchAsync(async (req, res, next) => {
  //1) getting token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //2) check of its there
  if (!token) {
    return next(
      new AppError('You are not logged in! please login to get access', 401),
    );
  }
  // 3) verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //we getting { id: '67e224ef394738f52f23aac6', iat: 1742878688, exp: 1750654688 } user id-payload ,created & expired time of token

  //we implement this because what if user login nd someone stole his token then he changed pass to protect data. what we should do now dont login user
  //3)check if user still exits
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('user belonging to this token  doesnt exists', 401),
    );
  }
  //4)check if user changed passsword after the token was issued
  if (freshUser.changedPasswordAfter(decoded.id)) {
    return next(new AppError('user had changed password '));
  }
  req.user = freshUser;
  next();
});

// Only for rendered pages, no errors!
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

//Authorization & roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not access'));
    }
    next();
  };
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  //1) Find user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Not found user', 404));
  }
  //2) create reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to user email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetTokenExpires = undefined;
    user.passwordResetToken = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError(`Email not send ${error}`, 500));
  }
});
export const resetPassword = catchAsync(async (req, res, next) => {
  //1)Get token & hash it & exists
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  //2)Token expires & User exists
  if (!user) {
    return next(new AppError('Token invalid or expired'));
  }

  //3)Change pass
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  //4)change changedPass property
  // user.changedPasswordAfter=Date.now()-1000;

  //5)Send jwt token
  createSendToken(201, user, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  //not use findByIdAndUpdate -> pre save not works & this not access
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('User doesnt exists'));
  //2)check current pass is correct
  const correct = await user.correctPassword(
    req.body.currentPassword,
    user.password,
  );
  if (!correct) return next(new AppError('Password not correct', 401));
  //3)update pass
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4)send login jwt
  createSendToken(200, user, res);
});
