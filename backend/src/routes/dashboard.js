const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Dashboard routes
router.get('/', dashboardController.getDashboard);
router.post('/invest', dashboardController.createInvestment);
router.post('/withdraw', dashboardController.withdrawIncome);

module.exports = router;