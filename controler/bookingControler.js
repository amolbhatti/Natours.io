const Booking = require('../models/bookingModel');

const stripe = require('stripe')(
  'sk_test_51HKAC6GcejTQJKnXzfFUAhCQ8ggKddg0gXC01MvCSk5mc58zFalPIIF8LHQWG2sNo19XPW8cfXUgxIb0CYWgK8na00raTg2QN2'
);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

module.exports.getCheckout = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  //create stripe checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name}`,
        description: tour.summary,
        images: [
          'https://images.unsplash.com/photo-1625426164670-35cd71766e9f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

module.exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

module.exports.createNewBooking = createOne(Booking);
module.exports.getBooking = getOne(Booking);
module.exports.getAllBooking = getAll(Booking);
module.exports.deleteBooking = deleteOne(Booking);
module.exports.updateBooking = updateOne(Booking);
