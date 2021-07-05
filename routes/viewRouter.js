const express = require('express');
const {
  getOverview,
  getTour,
  signin,
  AboutMe,
  getMyTours,
} = require('../controler/viewControler');

const { isLoggedIn, protect } = require('../controler/authControler');
const { createBooking } = require('../controler/bookingControler');

const router = express.Router();
router.get('/', createBooking, isLoggedIn, getOverview);
router.get('/tours/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, signin);
router.get('/me', protect, AboutMe);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
