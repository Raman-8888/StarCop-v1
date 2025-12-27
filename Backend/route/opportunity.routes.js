const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunity.controller');
const { protect: verifyToken } = require('../middleware/auth.middleware');
const { checkBlocked } = require('../middleware/checkBlocked.middleware');
const upload = require('../middleware/multer'); // Use multer for uploads

// Public/Shared
router.get('/', opportunityController.getAllOpportunities); // Investor Feed

// Startup Routes (Specific paths first)
router.get('/startup/my', verifyToken, opportunityController.getMyOpportunities);
router.get('/startup/my-interests', verifyToken, opportunityController.getIncomingInterests);

// Investor Routes (Specific paths first)
router.get('/investor/saved', verifyToken, opportunityController.getSavedOpportunities); // View Saved
router.get('/investor/sent-interests', verifyToken, opportunityController.getSentInterests); // View Sent Interests

// Download Route
router.get('/:id/download-deck', opportunityController.downloadDeck);

// Generic Routes (Parameterized paths last)
router.get('/:id', opportunityController.getOpportunityById);

router.post('/', verifyToken, upload.fields([
    { name: 'pitchVideo', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'deck', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
]), opportunityController.createOpportunity);

router.put('/:id', verifyToken, upload.fields([
    { name: 'pitchVideo', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'deck', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
]), opportunityController.updateOpportunity);

router.delete('/:id', verifyToken, opportunityController.deleteOpportunity);
router.put('/interest/:id/status', verifyToken, opportunityController.updateInterestStatus); // Accept/Reject

router.post('/:id/interest', verifyToken, upload.fields([
    { name: 'requestVideo', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]), opportunityController.sendInterest);
router.post('/:id/save', verifyToken, opportunityController.toggleSaveOpportunity);
router.get('/investor/saved', verifyToken, opportunityController.getSavedOpportunities); // View Saved

module.exports = router;
