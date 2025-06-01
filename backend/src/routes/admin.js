const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Withdrawal management
router.get('/withdrawals', adminController.getAllWithdrawals);
router.get('/withdrawals/stats', adminController.getWithdrawalStats);
router.post('/withdrawals/:requestId/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:requestId/reject', adminController.rejectWithdrawal);
router.patch('/withdrawals/:requestId/status', adminController.updateWithdrawalStatus);

module.exports = router; 