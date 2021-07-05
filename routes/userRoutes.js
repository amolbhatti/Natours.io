const express = require('express');

const router = express.Router();
const {
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controler/userControler'); // export functions from controller

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} = require('../controler/authControler');

// routes
router.post('/signup', signup);
router.post('/login', signin);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//protects all route after this middleware
router.use(protect);

router.patch('/updateMyPassword', restrictTo('user'), updatePassword);
router.patch(
  '/updateMe',
  restrictTo('user'),
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
router.delete('/deleteMe', restrictTo('user'), deleteMe);
router.get('/me', getMe, restrictTo('user'), getUser);

//grant access to specified role to route after this middleware
router.use(restrictTo('admin'));

router.get('/', getAllUser);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
