const Review = require('../models/reviewModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

// const AppError = require('../utils/appError');

module.exports.getAllReview = getAll(Review);

//Middleware to set tour and user id to body
module.exports.setUserTourId = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};
module.exports.createReview = createOne(Review);
module.exports.getReview = getOne(Review);
module.exports.deleteReview = deleteOne(Review);
module.exports.updateReview = updateOne(Review);
