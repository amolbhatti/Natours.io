const express = require('express');
const {
  getOverview,
  getTour,
  signin,
  AboutMe,
  getMyTours,
  alerts,
} = require('../controler/viewControler');

const { isLoggedIn, protect } = require('../controler/authControler');

const router = express.Router();
router.use(alerts);
router.get('/', isLoggedIn, getOverview);
router.get('/tours/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, signin);
router.get('/me', protect, AboutMe);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
