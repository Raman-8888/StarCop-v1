const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { checkBlocked } = require('../middleware/checkBlocked.middleware');
const messageRequestController = require('../controllers/messageRequest.controller');

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// All routes require authentication
router.use(protect);

// Send message request from profile
router.post('/send', checkBlocked, upload.single('file'), messageRequestController.sendMessageRequest);

// Get all pending message requests
router.get('/', messageRequestController.getMessageRequests);

// Accept a message request
router.post('/:id/accept', messageRequestController.acceptMessageRequest);

// Reject a message request
router.post('/:id/reject', messageRequestController.rejectMessageRequest);

// Check request status with specific user
router.get('/check/:userId', messageRequestController.checkMessageRequestStatus);

module.exports = router;
