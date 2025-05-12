import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { type } from 'os';

//schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: 'string',
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this works on create & save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  createdAt: Date,
  changedPassword: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//document middleware

userSchema.pre('save', async function (next) {
  //dont encrypt pass when email update
  //do encrypt pass when create or update password
  if (!this.isModified('password')) return next();
  //hash pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //to remove or not persist field in db
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password' || this.isNew)) return next();
  this.changedPassword = Date.now() - 1000;
  next();
});

//query middleware
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.changedPassword) {
    const changedPass = parseInt(this.changedPassword.getTime() / 1000, 10);
    return jwtTimeStamp < changedPass;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

//Model
const User = mongoose.model('User', userSchema);
export default User;
