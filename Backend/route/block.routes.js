const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const blockController = require('../controllers/block.controller');

// All routes require authentication
router.use(protect);

// Block a user
router.post('/:userId', blockController.blockUser);

// Unblock a user
router.delete('/:userId', blockController.unblockUser);

// Get list of blocked users
router.get('/', blockController.getBlockedUsers);

// Check block status with specific user
router.get('/check/:userId', blockController.checkBlockStatus);

module.exports = router;
