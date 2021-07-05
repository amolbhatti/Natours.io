const express = require('express');
const {
  getCheckout,
  getAllBooking,
  createNewBooking,
  getBooking,
  deleteBooking,
  updateBooking,
} = require('../controler/bookingControler');
const { protect, restrictTo } = require('../controler/authControler'); //PROTECTING ROUT

const router = express.Router();

router.use(protect);
router.get('/checkout-sessin/:tourId', getCheckout);

router.use(restrictTo('admin', 'lead-guid'));
router.route('/').get(getAllBooking).post(createNewBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
