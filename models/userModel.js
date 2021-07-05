const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: {
      values: true,
      message: 'Please provide your email',
    },
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
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
      //This works on CREATE and SAVE.
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guid', 'lead-guid', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// MIDDLEWARE
// DOCUMENT MIDDLEWARE
userSchema.pre('save', async function (next) {
  // only runs this function if password was actually modified
  if (!this.isModified('password')) return next();

  // hashing or encrypting password with costt of 12
  this.password = await bcrypt.hash(this.password, 12);

  // deleting passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: true });
  next();
});

// INSTANCE METHODS
// used in signin controller
userSchema.methods.correctPassword = async function (
  normalPassword,
  encryptPassword
) {
  return await bcrypt.compare(normalPassword, encryptPassword);
};
// used in protect conroller
userSchema.methods.changedPassworedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTS;
  }
  //False means password has not been changed
  return false;
};

//Used in forgotPassword controler
userSchema.methods.creatPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model('User', userSchema);
