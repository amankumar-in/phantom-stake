const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require admin authentication
router.use(adminAuth);

// Withdrawal management routes
router.get('/withdrawals', adminController.getAllWithdrawals);
router.get('/withdrawals/stats', adminController.getWithdrawalStats);
router.post('/withdrawals/:requestId/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:requestId/reject', adminController.rejectWithdrawal);
router.patch('/withdrawals/:requestId/status', adminController.updateWithdrawalStatus);

// User management routes
router.get('/users', adminController.listUsers); // List all users
router.post('/users', adminController.addUser); // Add new user
router.put('/users/:userId', adminController.editUser); // Edit user
router.delete('/users/:userId', adminController.deleteUser); // Delete user
router.post('/users/:userId/reset-password', adminController.resetPassword); // Reset password
router.post('/users/:userId/set-admin', adminController.setAdmin); // Set admin
router.post('/users/:userId/unset-admin', adminController.unsetAdmin); // Unset admin
router.post('/users/:userId/block', adminController.blockUser); // Block user
router.post('/users/:userId/unblock', adminController.unblockUser); // Unblock user
router.post('/users/:userId/enable-deposit', adminController.enableDeposit); // Enable deposit
router.post('/users/:userId/disable-deposit', adminController.disableDeposit); // Disable deposit
router.post('/users/:userId/enable-withdrawal', adminController.enableWithdrawal); // Enable withdrawal
router.post('/users/:userId/disable-withdrawal', adminController.disableWithdrawal); // Disable withdrawal
router.get('/users/:userId/investments', adminController.getUserInvestments); // Get user investments
router.get('/users/:userId/earnings', adminController.getUserEarnings); // Get user earnings

module.exports = router; 