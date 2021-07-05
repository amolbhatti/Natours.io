const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apifeatures');
// creating  generic function for some action like delete.. etc to avoid repetitions of code
module.exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

module.exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

module.exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //   const newTour = new Tour({});
    //   newTour.save();
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: newDoc,
    });
  });

module.exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

module.exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    //Exequting query
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .exclude()
      .pagination();
    const alldoc = await features.query;
    // sending response
    res.status(200).json({
      status: 'success',
      count: alldoc.length,
      data: {
        data: alldoc,
      },
    });
  });
