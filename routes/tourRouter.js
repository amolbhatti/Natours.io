const express = require('express');

const router = express.Router();
const reviewRouter = require('./reviewRouter');
const {
  getAllToures,
  getToures,
  addTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  stats,
  monthlyPlan,
  getClosestTour,
  getDistances,
  uploadTourImages,
  resizeTourPhoto,
} = require('../controler/touresController'); // export functions from controller

const { protect, restrictTo } = require('../controler/authControler'); //PROTECTING ROUT

router.use('/:tourId/reviews', reviewRouter);
// routes

router.get('/', getAllToures);
router.get('/top-5-tour', aliasTopTour, getAllToures);
router.get('/tour-stats', stats);
router.get(
  '/monthly-plan/:year',
  protect,
  restrictTo('admin', 'lead-guid', 'guid'),
  monthlyPlan
);
router.get('/:id', getToures);
router.post('/', protect, restrictTo('admin', 'lead-guid'), addTour);
router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'lead-guid'),
  uploadTourImages,
  resizeTourPhoto,
  updateTour
);
router.delete('/:id', protect, restrictTo('admin', 'lead-guid'), deleteTour);

//GEOSPACIAL DATA
///tours-within/:distance/center/:latlng/unit/:unit
router.get('/tours-within/:distance/center/:latlng/unit/:unit', getClosestTour);
router.get('/distance/:latlng/unit/:unit', getDistances);

module.exports = router;
