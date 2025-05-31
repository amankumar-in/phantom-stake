const User = require('../models/User');

const walletController = {
  // Get wallet overview
  getWalletOverview: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if principal wallet should be unlocked
      user.unlockPrincipalWallet();
      await user.save();

      res.status(200).json({
        status: 'success',
        data: {
          principal: {
            balance: user.wallets.principal.balance,
            locked: user.wallets.principal.locked,
            lockExpiry: user.wallets.principal.lockExpiry,
            totalDeposited: user.wallets.principal.totalDeposited,
            canWithdraw: !user.wallets.principal.locked,
          },
          income: {
            balance: user.wallets.income.balance,
            totalEarned: user.wallets.income.totalEarned,
            totalWithdrawn: user.wallets.income.totalWithdrawn,
            compoundingActive: !!user.wallets.income.compoundingStart,
            compoundingRate: user.wallets.income.compoundingRate,
            canWithdraw: user.wallets.income.balance >= 50, // Min withdrawal amount for testing
          },
          summary: {
            totalBalance: user.totalBalance,
            availableBalance: user.availableBalance,
            lockedBalance: user.lockedBalance,
            dailyEarnings: user.dailyEarnings,
          },
        },
      });
    } catch (error) {
      console.error('Wallet overview error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch wallet data',
      });
    }
  },

  // Process dummy deposit (for testing)
  dummyDeposit: async (req, res) => {
    try {
      const { amount, description } = req.body;

      // Validate amount
      if (!amount || amount < 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum deposit amount is $50',
        });
      }

      if (amount > 50000) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum test deposit amount is $50,000',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Process the dummy deposit
      await user.processDummyDeposit(amount, description || `Test deposit of $${amount}`);

      res.status(200).json({
        status: 'success',
        message: 'Dummy deposit processed successfully',
        data: {
          amount: amount,
          newPrincipalBalance: user.wallets.principal.balance,
          totalBalance: user.totalBalance,
          lockExpiry: user.wallets.principal.lockExpiry,
        },
      });
    } catch (error) {
      console.error('Dummy deposit error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process deposit',
      });
    }
  },

  // Process withdrawal from income wallet
  processWithdrawal: async (req, res) => {
    try {
      const { amount, description } = req.body;

      // Validate amount
      if (!amount || amount < 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum withdrawal amount is $50',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if user has sufficient balance
      if (user.wallets.income.balance < amount) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient income balance. Available: $${user.wallets.income.balance.toFixed(2)}`,
        });
      }

      // Process the withdrawal
      await user.processWithdrawal(amount, description);

      // Calculate fee and net amount for response
      const fee = amount * 0.05;
      const netAmount = amount - fee;

      res.status(200).json({
        status: 'success',
        message: 'Withdrawal processed successfully',
        data: {
          requestedAmount: amount,
          fee: fee,
          netAmount: netAmount,
          newIncomeBalance: user.wallets.income.balance,
          totalBalance: user.totalBalance,
        },
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process withdrawal',
      });
    }
  },

  // Process principal wallet withdrawal (after unlock)
  withdrawPrincipal: async (req, res) => {
    try {
      const { amount, description } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if principal wallet is unlocked
      user.unlockPrincipalWallet();
      
      if (user.wallets.principal.locked) {
        return res.status(400).json({
          status: 'error',
          message: `Principal wallet is locked until ${user.wallets.principal.lockExpiry.toLocaleDateString()}`,
        });
      }

      // Validate amount
      if (!amount || amount < 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum withdrawal amount is $50',
        });
      }

      if (user.wallets.principal.balance < amount) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient principal balance. Available: $${user.wallets.principal.balance.toFixed(2)}`,
        });
      }

      // Calculate fee and net amount
      const fee = amount * 0.05;
      const netAmount = amount - fee;

      // Process withdrawal from principal wallet
      user.wallets.principal.balance -= amount;

      // Add transaction record
      user.transactions.push({
        type: 'withdrawal',
        amount: netAmount,
        walletType: 'principal',
        description: `${description || 'Principal withdrawal'} (Net: $${netAmount.toFixed(2)}, Fee: $${fee.toFixed(2)})`,
        status: 'completed',
        date: new Date(),
      });

      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Principal withdrawal processed successfully',
        data: {
          requestedAmount: amount,
          fee: fee,
          netAmount: netAmount,
          newPrincipalBalance: user.wallets.principal.balance,
          totalBalance: user.totalBalance,
        },
      });
    } catch (error) {
      console.error('Principal withdrawal error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process principal withdrawal',
      });
    }
  },

  // Add dummy income (for testing ROI simulation)
  addDummyIncome: async (req, res) => {
    try {
      const { amount, description } = req.body;

      // Validate amount
      if (!amount || amount < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum income amount is $1',
        });
      }

      if (amount > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum test income amount is $1,000',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Add to income wallet
      user.wallets.income.balance += amount;
      user.wallets.income.totalEarned += amount;

      // Add transaction record
      user.transactions.push({
        type: 'roi_credit',
        amount: amount,
        walletType: 'income',
        description: description || `Test income credit of $${amount}`,
        status: 'completed',
        date: new Date(),
      });

      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Dummy income added successfully',
        data: {
          amount: amount,
          newIncomeBalance: user.wallets.income.balance,
          totalEarned: user.wallets.income.totalEarned,
          totalBalance: user.totalBalance,
        },
      });
    } catch (error) {
      console.error('Dummy income error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to add dummy income',
      });
    }
  },

  // Get transaction history
  getTransactionHistory: async (req, res) => {
    try {
      const { page = 1, limit = 20, type, walletType } = req.query;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      let transactions = [...user.transactions];

      // Filter by type if specified
      if (type) {
        transactions = transactions.filter(tx => tx.type === type);
      }

      // Filter by wallet type if specified
      if (walletType) {
        transactions = transactions.filter(tx => tx.walletType === walletType);
      }

      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = transactions.slice(startIndex, endIndex);

      // Calculate summary statistics
      const summary = {
        totalTransactions: transactions.length,
        totalDeposits: transactions
          .filter(tx => tx.type === 'deposit')
          .reduce((sum, tx) => sum + tx.amount, 0),
        totalWithdrawals: transactions
          .filter(tx => tx.type === 'withdrawal')
          .reduce((sum, tx) => sum + tx.amount, 0),
        totalROI: transactions
          .filter(tx => tx.type === 'roi_credit')
          .reduce((sum, tx) => sum + tx.amount, 0),
        totalReferralBonus: transactions
          .filter(tx => tx.type === 'referral_bonus')
          .reduce((sum, tx) => sum + tx.amount, 0),
      };

      res.status(200).json({
        status: 'success',
        data: {
          transactions: paginatedTransactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(transactions.length / limit),
            totalTransactions: transactions.length,
            hasNext: endIndex < transactions.length,
            hasPrev: startIndex > 0,
          },
          summary,
        },
      });
    } catch (error) {
      console.error('Transaction history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch transaction history',
      });
    }
  },

  // Get wallet statistics
  getWalletStats: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Calculate various statistics
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const recentTransactions = user.transactions.filter(
        tx => new Date(tx.date) >= thirtyDaysAgo
      );

      const weeklyTransactions = user.transactions.filter(
        tx => new Date(tx.date) >= sevenDaysAgo
      );

      const stats = {
        walletOverview: {
          totalBalance: user.totalBalance,
          principalBalance: user.wallets.principal.balance,
          incomeBalance: user.wallets.income.balance,
          lockedAmount: user.lockedBalance,
          availableForWithdrawal: user.availableBalance,
        },
        
        lifetimeStats: {
          totalDeposited: user.wallets.principal.totalDeposited,
          totalEarned: user.wallets.income.totalEarned,
          totalWithdrawn: user.wallets.income.totalWithdrawn,
          netProfit: user.wallets.income.totalEarned - user.wallets.income.totalWithdrawn,
        },

        recentActivity: {
          thirtyDayDeposits: recentTransactions
            .filter(tx => tx.type === 'deposit')
            .reduce((sum, tx) => sum + tx.amount, 0),
          thirtyDayWithdrawals: recentTransactions
            .filter(tx => tx.type === 'withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0),
          thirtyDayROI: recentTransactions
            .filter(tx => tx.type === 'roi_credit')
            .reduce((sum, tx) => sum + tx.amount, 0),
          
          weeklyDeposits: weeklyTransactions
            .filter(tx => tx.type === 'deposit')
            .reduce((sum, tx) => sum + tx.amount, 0),
          weeklyWithdrawals: weeklyTransactions
            .filter(tx => tx.type === 'withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0),
          weeklyROI: weeklyTransactions
            .filter(tx => tx.type === 'roi_credit')
            .reduce((sum, tx) => sum + tx.amount, 0),
        },

        projections: {
          dailyROI: user.dailyEarnings,
          weeklyROI: user.dailyEarnings * 7,
          monthlyROI: user.dailyEarnings * 30,
          currentROIRate: user.programData.enhancedROI.qualified ? 
            user.programData.enhancedROI.rate : 0.75,
        },

        lockStatus: {
          principalLocked: user.wallets.principal.locked,
          lockExpiry: user.wallets.principal.lockExpiry,
          daysUntilUnlock: user.wallets.principal.locked && user.wallets.principal.lockExpiry ? 
            Math.max(0, Math.ceil((user.wallets.principal.lockExpiry - new Date()) / (1000 * 60 * 60 * 24))) : 0,
        },
      };

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      console.error('Wallet stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch wallet statistics',
      });
    }
  },
};

module.exports = walletController; 