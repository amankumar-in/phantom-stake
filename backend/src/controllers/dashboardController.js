const User = require('../models/User');

const dashboardController = {
  // Get dashboard overview
  getDashboard: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('referral.referrals.user', 'username firstName lastName')
        .populate('referral.referredBy', 'username firstName lastName');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if principal wallet should be unlocked
      user.unlockPrincipalWallet();
      await user.save();

      // Calculate statistics using the new wallet system
      const totalInvestment = user.wallets.principal.totalDeposited;
      const totalBalance = user.totalBalance;
      const dailyEarnings = user.dailyEarnings;
      const monthlyEarnings = dailyEarnings * 30;

      // Wallet balances
      const principalWalletBalance = user.wallets.principal.balance;
      const incomeWalletBalance = user.wallets.income.balance;
      const totalEarnings = user.wallets.income.totalEarned;

      // Get active investments (legacy support)
      const activeInvestments = user.investments.filter(inv => inv.status === 'active');

      // Calculate referral statistics
      const totalReferrals = user.referral.referrals.length;
      const totalReferralEarnings = user.referral.totalReferralEarnings;

      // Calculate team statistics
      const leftTeamVolume = user.team.teamVolume.left;
      const rightTeamVolume = user.team.teamVolume.right;
      const totalTeamVolume = leftTeamVolume + rightTeamVolume;
      const pairs = user.team.pairs;

      // Determine next milestone based on current program
      let nextMilestone = null;
      const currentProgram = user.programData.currentProgram;
      
      // Program I milestones
      const milestonesProgram1 = [
        { pairs: 100, reward: '$500 + iPad' },
        { pairs: 250, reward: '$1,500 + MacBook Pro' },
        { pairs: 500, reward: '$5,000 + Tesla Model 3' },
        { pairs: 1000, reward: '$10,000 + Luxury Villa' },
      ];

      for (const milestone of milestonesProgram1) {
        if (pairs < milestone.pairs) {
          nextMilestone = {
            ...milestone,
            progress: (pairs / milestone.pairs) * 100,
            remaining: milestone.pairs - pairs,
          };
          break;
        }
      }

      // Calculate rank bonus based on team volume and rank
      let rankBonus = 0;
      const thirtyDayVolume = user.team.teamVolume.thirtyDayTotal;
      
      switch (user.team.rank) {
        case 'Bronze':
          rankBonus = thirtyDayVolume >= 5000 ? 50 : 0;
          break;
        case 'Silver':
          rankBonus = thirtyDayVolume >= 50000 ? 1000 : 0;
          break;
        case 'Gold':
          rankBonus = thirtyDayVolume >= 150000 ? 4500 : 0;
          break;
        case 'Diamond':
          rankBonus = thirtyDayVolume >= 500000 ? 20000 : 0;
          break;
        case 'Ruby':
          rankBonus = thirtyDayVolume >= 1000000 ? 50000 : 0;
          break;
      }

      // Get recent transactions for activity feed
      const recentTransactions = user.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(tx => ({
          type: tx.type,
          amount: tx.amount,
          walletType: tx.walletType,
          description: tx.description,
          date: tx.date,
          status: tx.status,
        }));

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            referralCode: user.referral.referralCode,
            rank: user.team.rank,
          },
          
          // Financial Overview (New Wallet System)
          financial: {
            totalInvestment,
            totalBalance,
            principalWalletBalance,
            incomeWalletBalance,
            dailyEarnings,
            monthlyEarnings,
            totalEarnings,
            availableForWithdrawal: incomeWalletBalance,
            principalLocked: user.wallets.principal.locked,
            lockExpiry: user.wallets.principal.lockExpiry,
            currentROIRate: user.programData.enhancedROI.qualified ? 
              user.programData.enhancedROI.rate : 0.75,
          },

          // Wallet Details
          wallets: {
            principal: {
              balance: principalWalletBalance,
              locked: user.wallets.principal.locked,
              lockExpiry: user.wallets.principal.lockExpiry,
              totalDeposited: user.wallets.principal.totalDeposited,
              canWithdraw: !user.wallets.principal.locked,
            },
            income: {
              balance: incomeWalletBalance,
              totalEarned: user.wallets.income.totalEarned,
              totalWithdrawn: user.wallets.income.totalWithdrawn,
              canWithdraw: incomeWalletBalance >= 50,
              compoundingActive: !!user.wallets.income.compoundingStart,
              compoundingRate: user.wallets.income.compoundingRate,
            },
          },

          // Investment Details (Legacy + Current)
          investments: {
            active: activeInvestments.length,
            total: user.investments.length,
            principalAmount: principalWalletBalance,
            details: activeInvestments.map(inv => ({
              id: inv._id,
              amount: inv.amount,
              program: inv.program,
              startDate: inv.startDate,
              principalBalance: inv.principalWallet.balance,
              incomeBalance: inv.incomeWallet.balance,
              dailyROI: inv.dailyROI,
              lockedUntil: inv.principalWallet.lockedUntil,
              status: inv.status,
            })),
          },

          // Referral System
          referrals: {
            totalReferrals,
            totalReferralEarnings,
            directReferrals: user.referral.directReferrals,
            recentReferrals: user.referral.referrals.slice(-5).map(ref => ({
              user: ref.user,
              dateReferred: ref.dateReferred,
              commission: ref.commission,
              totalCommissionEarned: ref.totalCommissionEarned,
            })),
          },

          // Team Building & MLM
          team: {
            rank: user.team.rank,
            pairs,
            leftTeamVolume,
            rightTeamVolume,
            totalTeamVolume,
            thirtyDayVolume,
            rankBonus,
            nextMilestone,
            matchingBonus: {
              totalEarned: user.team.matchingBonus.totalEarned,
              todayEarned: user.team.matchingBonus.todayEarned,
              dailyLimit: user.team.matchingBonus.dailyLimit,
              remaining: Math.max(0, user.team.matchingBonus.dailyLimit - user.team.matchingBonus.todayEarned),
            },
          },

          // MLM Earnings Summary
          mlmEarnings: {
            levelOverrides: user.mlmEarnings.levelOverrides.totalEarned,
            leadershipPools: user.mlmEarnings.leadershipPools.totalEarned,
            milestoneRewards: user.mlmEarnings.milestoneRewards.totalValue,
            matchingBonus: user.team.matchingBonus.totalEarned,
          },

          // Program Information
          program: {
            current: user.programData.currentProgram,
            status: 'Active',
            launchDate: '2025-08-01',
            endDate: '2026-09-30',
            daysRemaining: Math.max(0, Math.ceil((new Date('2026-09-30') - new Date()) / (1000 * 60 * 60 * 24))),
            enhancedROI: {
              qualified: user.programData.enhancedROI.qualified,
              rate: user.programData.enhancedROI.rate,
              qualificationDate: user.programData.enhancedROI.qualificationDate,
            },
          },

          // Recent Activity
          recentActivity: recentTransactions,
        },
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard data',
      });
    }
  },

  // Create new investment (Updated for new wallet system)
  createInvestment: async (req, res) => {
    try {
      const { amount, walletAddress } = req.body;

      // Validate amount
      if (!amount || amount < 50) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum investment amount is $50',
        });
      }

      // Validate wallet address
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

      // Process investment as dummy deposit for testing
      await user.processDummyDeposit(amount, `Investment deposit of $${amount}`);

      // Update wallet address if provided
      if (walletAddress !== user.walletAddress) {
        user.walletAddress = walletAddress;
        await user.save();
      }

      res.status(201).json({
        status: 'success',
        message: 'Investment processed successfully',
        data: {
          amount: amount,
          walletAddress: walletAddress,
          newPrincipalBalance: user.wallets.principal.balance,
          totalBalance: user.totalBalance,
          dailyROI: user.dailyEarnings,
          lockExpiry: user.wallets.principal.lockExpiry,
        },
      });
    } catch (error) {
      console.error('Investment creation error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process investment',
      });
    }
  },

  // Withdraw income (Updated for new wallet system)
  withdrawIncome: async (req, res) => {
    try {
      const { amount } = req.body;

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

      // Check if user has sufficient income balance
      if (user.wallets.income.balance < amount) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient income balance. Available: $${user.wallets.income.balance.toFixed(2)}`,
        });
      }

      // Process the withdrawal
      await user.processWithdrawal(amount, 'Income withdrawal from dashboard');

      res.status(200).json({
        status: 'success',
        message: 'Withdrawal processed successfully',
        data: {
          withdrawnAmount: amount,
          fee: amount * 0.05,
          netAmount: amount * 0.95,
          newIncomeBalance: user.wallets.income.balance,
          totalBalance: user.totalBalance,
        },
      });
    } catch (error) {
      console.error('Income withdrawal error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process withdrawal',
      });
    }
  },
};

module.exports = dashboardController;