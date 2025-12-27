const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// Update profile route
const { protect } = require('../middleware/auth.middleware');
router.patch('/update-profile', protect, authController.updateProfile);

// Get current user
router.get('/me', protect, authController.getMe);

module.exports = router;
