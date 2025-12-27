const express = require('express');
const router = express.Router();
const multer = require('multer');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkBlocked } = require('../middleware/checkBlocked.middleware');

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (req, file, cb) => {
        // Allow images, videos, PDFs, and documents
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv', 'application/zip'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, PDFs, and documents are allowed.'));
        }
    }
});

router.get('/users/search', protect, chatController.searchUsers);
router.post('/conversations', protect, checkBlocked, chatController.createOrGetConversation);
router.get('/conversations', protect, chatController.getConversations);
router.get('/messages/:conversationId', protect, chatController.getMessages);
router.post('/messages', protect, upload.array('files', 5), checkBlocked, chatController.sendMessage);
router.delete('/messages/:messageId', protect, chatController.deleteMessage);
router.delete('/conversations/:conversationId', protect, chatController.deleteConversation);

module.exports = router;
