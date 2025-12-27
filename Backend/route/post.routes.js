const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer');

// Protected routes
router.post('/', protect, upload.single('image'), postController.createPost);
router.post('/:id/like', protect, postController.likePost);
router.post('/:id/comment', protect, postController.addComment);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments/:commentId/like', protect, postController.toggleCommentLike);
router.post('/:id/comments/:commentId/pin', protect, postController.toggleCommentPin);

// Public routes (or protected depending on requirements, usually public to view profile)
// But for now, let's keep it simple.
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;
