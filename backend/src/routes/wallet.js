const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');

// Apply auth middleware to all wallet routes
router.use(auth);

// Wallet routes
router.get('/details', walletController.getWalletDetails);
router.post('/deposit', walletController.depositFunds);
router.post('/withdraw-income', walletController.withdrawIncome);
router.post('/withdraw-principal', walletController.withdrawPrincipal);
router.post('/calculate-fees', walletController.calculateFees);
router.get('/lock-status', walletController.getLockStatus);

// Withdrawal management
router.get('/withdrawals', walletController.getWithdrawalHistory);
router.get('/withdrawals/:requestId', walletController.getWithdrawalRequest);
router.post('/withdrawals/:requestId/cancel', walletController.cancelWithdrawalRequest);

module.exports = router;