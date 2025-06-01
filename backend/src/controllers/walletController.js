const User = require('../models/User');
const Stake = require('../models/Stake');
const mlmService = require('../services/mlmService');
const WithdrawalRequest = require('../models/WithdrawalRequest');

const walletController = {
  // Get complete wallet details
  getWalletDetails: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Calculate days active (from first deposit)
      const daysActive = user.wallets.principal.totalDeposited > 0 
        ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate today's ROI
      const todayROI = user.wallets.principal.balance * 0.0075; // 0.75% daily

      // Get recent transactions from Transaction model
      let transactions = [];
      try {
        const Transaction = require('../models/Transaction');
        const recentTransactions = await Transaction.find({ 
          userId: user._id 
        })
        .sort({ createdAt: -1 })
        .limit(10);
        
        transactions = recentTransactions.map(tx => ({
          type: tx.type,
          amount: tx.amount,
          date: tx.createdAt,
        }));
      } catch (txError) {
        console.error('Error fetching transactions:', txError);
        // Fall back to basic transactions
        transactions = [
          {
            type: 'deposit',
            amount: user.wallets.principal.totalDeposited,
            date: user.createdAt,
          },
          {
            type: 'roi',
            amount: todayROI,
            date: new Date(),
          }
        ].filter(tx => tx.amount > 0);
      }

      const walletData = {
        principal: {
          balance: user.wallets.principal.balance,
          totalDeposited: user.wallets.principal.totalDeposited,
          locked: user.wallets.principal.locked,
          lockExpiry: user.wallets.principal.lockExpiry,
        },
        income: {
          balance: user.wallets.income.balance,
          totalEarned: user.wallets.income.totalEarned,
          totalWithdrawn: user.wallets.income.totalWithdrawn,
          todayROI: todayROI,
          daysWithoutWithdrawal: user.wallets.income.daysWithoutWithdrawal || 0,
          compounding: {
            active: user.wallets.income.compounding?.active || false,
            startDate: user.wallets.income.compounding?.startDate,
            rate: user.wallets.income.compounding?.rate || 0.01,
            totalCompounded: user.wallets.income.compounding?.totalCompounded || 0,
          }
        },
        daysActive,
        transactions,
      };

      res.json({
        status: 'success',
        data: walletData,
      });
    } catch (error) {
      console.error('Error getting wallet details:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get wallet details',
      });
    }
  },

  // Deposit funds to principal wallet
  depositFunds: async (req, res) => {
    /**
     * WARNING: This is a TEST SYSTEM ONLY implementation
     * 
     * For production with real Ethereum/USDT:
     * - Integrate Web3.js for blockchain interaction
     * - Create smart contracts for secure deposits
     * - Implement wallet connection (MetaMask, etc)
     * - Add transaction monitoring and confirmations
     * - Handle real gas fees and network delays
     * - Add comprehensive security measures
     * - Ensure regulatory compliance (KYC/AML)
     * 
     * NEVER use this code with real money without proper blockchain integration!
     */
    try {
      const { amount } = req.body;
      
      if (!amount || amount < 500) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum deposit is 500 USDT',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check for enhanced ROI qualification first
      const isEnhancedQualified = await Stake.checkUserEnhancedROIQualification(user._id);
      
      // Determine the ROI rate for this new stake
      let roiRate = 0.0075; // Base 0.75% for Program I
      let isEnhancedROI = false;
      
      if (isEnhancedQualified) {
        roiRate = 0.0085; // Enhanced 0.85% for qualified users
        isEnhancedROI = true;
      }

      // Add to principal wallet
      user.wallets.principal.balance += amount;
      user.wallets.principal.totalDeposited += amount;
      
      // Lock principal for 6 months if first deposit
      if (!user.wallets.principal.lockExpiry) {
        user.wallets.principal.locked = true;
        user.wallets.principal.lockExpiry = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months
      }

      // Create a new stake
      const stake = new Stake({
        userId: user._id,
        amount: amount,
        currency: 'USDT',
        roiRate: 0.0075, // Always store base rate
        actualROIRate: roiRate, // The rate this stake actually earns
        isEnhancedROI: isEnhancedROI, // Whether this stake gets enhanced rate
        lockPeriod: 180, // 6 months in days
        status: 'active',
        dailyROI: amount * roiRate, // Calculate based on actual rate
        enhancedROI: {
          qualified: isEnhancedQualified,
          rate: 0.0085,
          qualificationDate: isEnhancedQualified ? new Date() : null
        }
      });

      await stake.save();
      await user.save();

      // Add to leadership pool
      try {
        const LeadershipPool = require('../models/LeadershipPool');
        await LeadershipPool.addDeposit(amount, 'I');
      } catch (poolError) {
        console.error('Leadership pool error:', poolError);
        // Continue even if pool update fails
      }

      // Trigger MLM calculations
      try {
        // Update personal volume in binary tree
        await mlmService.updatePersonalVolume(user._id, amount);
        
        // Process level overrides for this deposit
        await mlmService.processLevelOverrides(user._id, 'deposit', amount);
      } catch (mlmError) {
        console.error('MLM processing error:', mlmError);
        // Continue even if MLM processing fails - deposit is already saved
      }

      res.json({
        status: 'success',
        message: 'Funds deposited successfully',
        data: {
          newBalance: user.wallets.principal.balance,
          lockExpiry: user.wallets.principal.lockExpiry,
          stakeId: stake._id,
          dailyROI: stake.dailyROI,
        },
      });
    } catch (error) {
      console.error('Error depositing funds:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to deposit funds',
      });
    }
  },

  // Withdraw from income wallet
  withdrawIncome: async (req, res) => {
    try {
      const { amount, walletAddress, network = 'ETH' } = req.body;
      
      if (!amount || amount < 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum withdrawal is 1,000 USDT',
        });
      }

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid Ethereum wallet address is required',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      if (user.wallets.income.balance < amount) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient income balance',
        });
      }

      // Calculate fees
      const feeDetails = WithdrawalRequest.calculateFees(amount);

      // Create withdrawal request
      const withdrawalRequest = new WithdrawalRequest({
        userId: user._id,
        amount,
        fees: {
          platform: feeDetails.platform,
          gas: feeDetails.gas,
          total: feeDetails.total,
        },
        netAmount: feeDetails.netAmount,
        walletAddress,
        network,
        status: 'pending',
        balanceSnapshot: {
          beforeWithdrawal: user.wallets.income.balance,
          afterWithdrawal: user.wallets.income.balance - amount,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      await withdrawalRequest.save();

      // Update balance immediately
      user.wallets.income.balance -= amount;
      user.wallets.income.totalWithdrawn += amount;

      // Break compounding on withdrawal
      const compoundingService = require('../services/compoundingService');
      await compoundingService.breakCompounding(user._id);

      await user.save();

      // Create a pending transaction record
      const Transaction = require('../models/Transaction');
      await Transaction.create({
        userId: user._id,
        type: 'withdrawal_request',
        category: 'income',
        amount: -amount,
        description: `Withdrawal request for ${amount} USDT (Pending approval)`,
        relatedId: withdrawalRequest._id,
        status: 'pending',
      });

      res.json({
        status: 'success',
        message: 'Withdrawal request submitted successfully',
        data: {
          requestId: withdrawalRequest._id,
          amount,
          platformFee: feeDetails.platform,
          gasFee: feeDetails.gas,
          netAmount: feeDetails.netAmount,
          newBalance: user.wallets.income.balance,
          status: 'pending',
          estimatedProcessingTime: '24-48 hours',
          compoundingStatus: {
            active: false,
            message: 'Compounding has been reset due to withdrawal'
          }
        },
      });
    } catch (error) {
      console.error('Error processing withdrawal request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process withdrawal request',
      });
    }
  },

  // Withdraw from principal wallet (if unlocked)
  withdrawPrincipal: async (req, res) => {
    try {
      const { amount } = req.body;
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if principal is locked
      if (user.wallets.principal.locked && new Date() < user.wallets.principal.lockExpiry) {
        return res.status(400).json({
          status: 'error',
          message: 'Principal wallet is still locked',
        });
      }

      if (user.wallets.principal.balance < amount) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient principal balance',
        });
      }

      // Calculate fees
      const platformFee = amount * 0.05; // 5%
      const gasFee = 5; // 5 USDT minimum
      const totalFees = platformFee + gasFee;
      const netAmount = amount - totalFees;

      // Update balance
      user.wallets.principal.balance -= amount;

      await user.save();

      res.json({
        status: 'success',
        message: 'Principal withdrawal processed successfully',
        data: {
          amount,
          platformFee,
          gasFee,
          netAmount,
          newBalance: user.wallets.principal.balance,
        },
      });
    } catch (error) {
      console.error('Error withdrawing principal:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process principal withdrawal',
      });
    }
  },

  // Calculate fees for a withdrawal
  calculateFees: async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({
          status: 'error',
          message: 'Amount is required',
        });
      }

      const platformFee = amount * 0.05; // 5%
      const gasFee = 5; // 5 USDT minimum
      const totalFees = platformFee + gasFee;
      const netAmount = amount - totalFees;

      res.json({
        status: 'success',
        data: {
          amount,
          platformFee,
          gasFee,
          totalFees,
          netAmount,
          feePercentage: 5,
        },
      });
    } catch (error) {
      console.error('Error calculating fees:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to calculate fees',
      });
    }
  },

  // Get lock status
  getLockStatus: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const now = new Date();
      const lockExpiry = user.wallets.principal.lockExpiry;
      const isLocked = user.wallets.principal.locked && lockExpiry && now < lockExpiry;
      
      let daysRemaining = 0;
      if (isLocked) {
        daysRemaining = Math.ceil((lockExpiry - now) / (1000 * 60 * 60 * 24));
      }

      res.json({
        status: 'success',
        data: {
          locked: isLocked,
          lockExpiry,
          daysRemaining,
          canWithdrawPrincipal: !isLocked,
        },
      });
    } catch (error) {
      console.error('Error getting lock status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get lock status',
      });
    }
  },

  // Get withdrawal history
  getWithdrawalHistory: async (req, res) => {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      
      const query = { userId: req.user._id };
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const withdrawals = await WithdrawalRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('processedBy', 'username firstName lastName');
      
      const total = await WithdrawalRequest.countDocuments(query);
      
      res.json({
        status: 'success',
        data: {
          withdrawals,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get withdrawal history',
      });
    }
  },

  // Get withdrawal request details
  getWithdrawalRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      
      const withdrawal = await WithdrawalRequest.findOne({
        _id: requestId,
        userId: req.user._id,
      }).populate('processedBy', 'username firstName lastName');
      
      if (!withdrawal) {
        return res.status(404).json({
          status: 'error',
          message: 'Withdrawal request not found',
        });
      }
      
      res.json({
        status: 'success',
        data: withdrawal,
      });
    } catch (error) {
      console.error('Error getting withdrawal request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get withdrawal request',
      });
    }
  },

  // Cancel withdrawal request (only if pending)
  cancelWithdrawalRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      
      const withdrawal = await WithdrawalRequest.findOne({
        _id: requestId,
        userId: req.user._id,
        status: 'pending',
      });
      
      if (!withdrawal) {
        return res.status(404).json({
          status: 'error',
          message: 'Pending withdrawal request not found',
        });
      }
      
      // Refund the amount back to income wallet
      const user = await User.findById(req.user._id);
      user.wallets.income.balance += withdrawal.amount;
      user.wallets.income.totalWithdrawn -= withdrawal.amount;
      await user.save();
      
      // Update withdrawal status
      withdrawal.status = 'cancelled';
      withdrawal.processedAt = new Date();
      withdrawal.notes = 'Cancelled by user';
      await withdrawal.save();
      
      // Create refund transaction
      const Transaction = require('../models/Transaction');
      await Transaction.create({
        userId: user._id,
        type: 'withdrawal_cancelled',
        category: 'income',
        amount: withdrawal.amount,
        description: 'Withdrawal request cancelled',
        relatedId: withdrawal._id,
        status: 'completed',
      });
      
      res.json({
        status: 'success',
        message: 'Withdrawal request cancelled successfully',
        data: {
          newBalance: user.wallets.income.balance,
          refundedAmount: withdrawal.amount,
        },
      });
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel withdrawal request',
      });
    }
  },
};

// Helper function to check enhanced ROI qualification
async function checkEnhancedROIQualification(userId) {
  try {
    const user = await User.findById(userId);
    const totalStake = user.wallets.principal.totalDeposited;
    
    // Check if user has >= $5,000 total stake
    if (totalStake >= 5000) {
      // Check for qualified referrals (>= $1,000 stake)
      const qualifiedReferrals = await User.countDocuments({
        referredBy: userId,
        'wallets.principal.totalDeposited': { $gte: 1000 }
      });

      if (qualifiedReferrals >= 1) {
        // Update all active stakes to enhanced ROI
        await Stake.updateMany(
          { userId: userId, status: 'active' },
          { 
            roiRate: 0.0085, // 0.85%
            enhancedROI: true,
            dailyROI: { $mul: 0.0085 / 0.0075 } // Update daily ROI proportionally
          }
        );
      }
    }
  } catch (error) {
    console.error('Error checking enhanced ROI qualification:', error);
  }
}

module.exports = walletController;