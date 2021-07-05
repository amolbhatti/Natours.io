const express = require('express');
const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  setUserTourId,
  getReview,
} = require('../controler/reviewControler');
const { protect, restrictTo } = require('../controler/authControler'); //PROTECTING ROUT

const router = express.Router({ mergeParams: true });

router.use(protect);
router
  .route('/')
  .get(getAllReview)
  .post(restrictTo('user'), setUserTourId, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);

module.exports = router;
