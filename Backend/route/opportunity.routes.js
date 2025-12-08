const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunity.controller');
const verifyToken = require('../middleware/authMiddleware');

// Public/Startup Routes
router.get('/', opportunityController.getAllOpportunities);
router.get('/:id', opportunityController.getOpportunityById);
router.post('/:id/apply', verifyToken, opportunityController.applyToOpportunity);
router.get('/my/applications', verifyToken, opportunityController.getMyApplications);

// Investor Routes
router.post('/', verifyToken, opportunityController.createOpportunity);
router.delete('/:id', verifyToken, opportunityController.deleteOpportunity);
router.get('/:id/applications', verifyToken, opportunityController.getOpportunityApplications);
router.put('/application/:id/status', verifyToken, opportunityController.updateApplicationStatus);

module.exports = router;
