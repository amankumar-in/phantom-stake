const express = require('express');
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

// Wallet overview and stats
router.get('/overview', walletController.getWalletOverview);
router.get('/stats', walletController.getWalletStats);
router.get('/transactions', walletController.getTransactionHistory);

// Dummy operations for testing
router.post('/dummy-deposit', walletController.dummyDeposit);
router.post('/dummy-income', walletController.addDummyIncome);

// Withdrawal operations
router.post('/withdraw-income', walletController.processWithdrawal);
router.post('/withdraw-principal', walletController.withdrawPrincipal);

module.exports = router; 