const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const connectionController = require('../controllers/connection.controller');

// All routes require authentication
router.use(protect);

// Get all connections for current user
router.get('/', connectionController.getMyConnections);

// Check connection with specific user
router.get('/check/:userId', connectionController.checkConnection);

// Get specific connection by ID
router.get('/:id', connectionController.getConnectionById);

// Block/unblock a connection
router.patch('/:id/block', connectionController.toggleBlockConnection);

module.exports = router;
