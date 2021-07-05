const AppError = require('../utils/appError');

const handelJsonWebTokenErrorErrorJWT = () =>
  new AppError('Invalid Token ! Please log In again', 401);

const handelTokenExpiredErrorJWT = () =>
  new AppError('Your token has expired ! Please log In again', 401);

const handleVAlidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};
const sendErrorDev = (res, err, req) => {
  //A) APi
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B) Rendered Website
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong!', msg: err.message });
};

const sendErrorProd = (res, err, req) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //A)operational trusted error: send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR ✨', err);
    //generic message
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  //B) rendered website
  //A)operational trusted error: send message to the client
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong!', msg: err.message });
  }
  //Programming or other unknown error
  console.error('ERROR ✨', err);
  //generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err, req);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleVAlidatorErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handelJsonWebTokenErrorErrorJWT();
    }
    if (error.name === 'TokenExpiredError') {
      error = handelTokenExpiredErrorJWT();
    }

    sendErrorProd(res, error, req);
  }
};
