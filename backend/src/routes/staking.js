const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createStake,
  getActiveStakes,
  calculateROIProjections,
  getROIHistory,
  checkEnhancedROIStatus,
  processDailyROI,
} = require('../controllers/stakingController');
const { manualROIProcessing } = require('../jobs/dailyROI');

// @route   POST /api/staking/create
// @desc    Create new stake
// @access  Private
router.post('/create', auth, createStake);

// @route   GET /api/staking/active
// @desc    Get user's active stakes
// @access  Private
router.get('/active', auth, getActiveStakes);

// @route   POST /api/staking/roi-projections
// @desc    Calculate ROI projections
// @access  Private
router.post('/roi-projections', auth, calculateROIProjections);

// @route   GET /api/staking/roi-history
// @desc    Get user's ROI payment history
// @access  Private
router.get('/roi-history', auth, getROIHistory);

// @route   GET /api/staking/enhanced-status
// @desc    Check enhanced ROI qualification status
// @access  Private
router.get('/enhanced-status', auth, checkEnhancedROIStatus);

// @route   POST /api/staking/process-daily-roi
// @desc    Process daily ROI for all stakes (admin/cron)
// @access  Private
router.post('/process-daily-roi', auth, processDailyROI);

// @route   POST /api/staking/manual-roi-processing
// @desc    Manually trigger daily ROI processing (admin)
// @access  Private
router.post('/manual-roi-processing', auth, async (req, res) => {
  try {
    const result = await manualROIProcessing();
    res.json({
      success: result.success,
      message: result.success ? 'Manual ROI processing completed' : 'ROI processing failed',
      data: result,
    });
  } catch (error) {
    console.error('Manual ROI processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during manual ROI processing',
    });
  }
});

module.exports = router;