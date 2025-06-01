const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { processROIManually } = require('../jobs/processROI');

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Dashboard routes
router.get('/', dashboardController.getDashboard);
router.post('/invest', dashboardController.createInvestment);
router.post('/withdraw', dashboardController.withdrawIncome);
router.post('/reset', dashboardController.resetUserData);

// Manual ROI processing (for testing)
router.post('/process-roi', async (req, res) => {
  try {
    const result = await processROIManually();
    res.json({
      status: 'success',
      message: 'ROI processed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process ROI',
      error: error.message
    });
  }
});

module.exports = router;