const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer');

// Public route to get profile by username
router.get('/search', protect, userController.searchUsers);
router.get('/:username', userController.getProfile);

// Protected routes
router.post('/follow/:id', protect, userController.followUser);
router.post('/unfollow/:id', protect, userController.unfollowUser);
router.put('/update', protect, upload.single('profilePicture'), userController.updateProfile);
router.post('/fcm-token', protect, userController.saveFcmToken);
router.get('/followers/:id', protect, userController.getFollowers);
router.get('/following/:id', protect, userController.getFollowing);

module.exports = router;
