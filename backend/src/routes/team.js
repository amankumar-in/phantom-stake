const express = require('express');
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All team routes require authentication
router.use(authMiddleware);

// Team overview and statistics
router.get('/overview', teamController.getTeamOverview);

// Binary tree routes
router.get('/tree', teamController.getBinaryTree);
router.post('/tree/expand', teamController.expandTree);

// Team members with filtering
router.get('/members', teamController.getTeamMembers);

// Matching bonus details
router.get('/matching/details', teamController.getMatchingDetails);

// Level override details
router.get('/overrides', teamController.getLevelOverrides);

// Direct referrals management
router.get('/referrals', teamController.getDirectReferrals);

// Team analytics and performance
router.get('/analytics', teamController.getTeamAnalytics);

module.exports = router; 