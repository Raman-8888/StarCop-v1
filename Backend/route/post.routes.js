const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes
router.post('/', protect, postController.createPost);

// Public routes (or protected depending on requirements, usually public to view profile)
// But for now, let's keep it simple.
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;
