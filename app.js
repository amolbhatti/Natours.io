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
const cors = require('cors');
const compression = require('compression');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');
const stripeWebhook = require('./controler/bookingControler');
const globalErrorHandler = require('./controler/errorControler');
const AppError = require('./utils/appError');

dotenv.config({ path: './config.env' }); // enviroment variable setup
const app = express();

app.enable('trust proxy');

// 1)template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 2) middleware
// serving static file
app.use(express.static(path.join(__dirname, 'public')));
// implimenting cors
app.use(cors());
// for pre-flight
app.options('*', cors());
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
//limit the no of request
app.use('/api', limiter);
app.use(compression());

// Stripe send post data in raw formet

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookie());

// Data sanitize against NoSql query injection
app.use(mongooSanitize());

// Data sanatize against XSS (html injection)
app.use(xss());

// Prevent parameter pollution (duplicacy)
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

//ROUTER MIDDLEWARE
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl}`, 404));
});

//ERROR HANDLE MIDDLEWARE
app.use(globalErrorHandler);

//Database connection
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
