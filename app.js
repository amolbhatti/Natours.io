const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const mongooSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookie = require('cookie-parser');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');

const globalErrorHandler = require('./controler/errorControler');
const AppError = require('./utils/appError');

dotenv.config({ path: './config.env' }); // enviroment variable setup
const app = express();

// 1)template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 2) middleware
// serving static file
app.use(express.static(path.join(__dirname, 'public')));

// https setter
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request  from this IP, please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookie());

// Data sanitize against NoSql query injection
app.use(mongooSanitize());

// data sanatize against XSS (html injection)
app.use(xss());

// prevent parameter pollution (duplicacy)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 2)router middleware
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl}`, 404));
});

//ERROR MIDDLEWARE
app.use(globalErrorHandler);

// 4) database connection
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected'));

module.exports = app;
