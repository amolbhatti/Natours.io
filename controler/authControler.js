const { promisify } = require('util');
const crypto = require('crypto');
const JWT = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const createToken = (id) =>
  JWT.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, req, res) => {
  const token = createToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      status: 'success',
      user: user,
    },
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req, res);
});
module.exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1)check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if every thing is okay send JWT to client
  createSendToken(user, 200, req, res);
});

//PROTECTED ROUTE
module.exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not Logged in ! Please log in to get access', 401)
    );
  }

  // 2) VERIFICATION OF TOKEN
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  // 3) CHECK IF USER EXISTS
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User no longer exist.', 401));
  }
  // 4)CHECK IF USER CHAGED PASSWORD AFTER ISSUING THE TOKEN
  if (freshUser.changedPassworedAfter(decoded.iat)) {
    return next(
      new AppError('Password was recently changed ! please login again', 401)
    );
  }

  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});

// Arguments cannot be passed in middleware
module.exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Yo do not have permission to perform this action', 403)
      );
    }
    next();
  };

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user exist with that email address', 404));
  }
  // 2) generate the random  reset token
  const resetToken = user.creatPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) send it back to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return new AppError(
      'there was an error sending email. try again later',
      500
    );
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) if token is valid and user exist ,set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changePasswordAt prop for user
  //4) send JWT to sign in
  createSendToken(user, 200, req, res);
});

module.exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 ) get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) check if psdted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Entered Password is Wrong', 401));
  }
  //3)if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) log user in send token
  createSendToken(user, 200, req, res);
});

// FOR VIEW ROUT, only for render pages no error
module.exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) verify token
      const decoded = await promisify(JWT.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) CHECK IF USER EXISTS
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      // 3)CHECK IF USER CHAGED PASSWORD AFTER ISSUING THE TOKEN
      if (freshUser.changedPassworedAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser;
    } catch (error) {
      return next();
    }
  }
  next();
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', 'Logged out successfully', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
