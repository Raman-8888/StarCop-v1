const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Public route to get profile by username
router.get('/:username', userController.getProfile);

// Protected routes
router.post('/follow/:id', protect, userController.followUser);
router.post('/unfollow/:id', protect, userController.unfollowUser);

module.exports = router;
