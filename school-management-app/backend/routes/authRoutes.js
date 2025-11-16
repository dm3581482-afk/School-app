const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updatePassword,
  getAllUsers
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.get('/users', protect, isAdmin, getAllUsers);

module.exports = router;
