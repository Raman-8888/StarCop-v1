const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/users/search', protect, chatController.searchUsers);
router.post('/conversations', protect, chatController.createOrGetConversation);
router.get('/conversations', protect, chatController.getConversations);
router.get('/messages/:conversationId', protect, chatController.getMessages);
router.post('/messages', protect, chatController.sendMessage);

module.exports = router;
