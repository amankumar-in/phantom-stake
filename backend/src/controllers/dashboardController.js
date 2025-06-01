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

      // Calculate investment statistics
      const investmentStats = {
        active: user.investments.filter(inv => inv.status === 'active').length,
        total: user.investments.length,
        details: user.investments.map(inv => ({
          id: inv._id.toString(),
          amount: inv.amount,
          program: inv.program,
          startDate: inv.startDate,
          principalBalance: inv.principalWallet?.balance || inv.amount,
          incomeBalance: inv.incomeWallet?.balance || 0,
          dailyROI: inv.dailyROI,
          status: inv.status,
        })),
      };

      // Calculate team statistics (using correct User model structure)
      const teamStats = {
        directReferrals: user.referral.directReferrals || 0,
        totalTeamSize: user.team.leftSide.length + user.team.rightSide.length,
        leftLegVolume: user.team.teamVolume.left || 0,
        rightLegVolume: user.team.teamVolume.right || 0,
        totalVolume: user.team.teamVolume.total || 0,
        currentRank: user.team.rank || 'Bronze',
      };

      // Calculate actual progress to next milestone based on real data
      const calculateMilestoneProgress = () => {
        const currentPairs = user.team.pairs || 0;
        
        // MLM Milestone thresholds based on pairs (not volume)
        const milestones = [
          { threshold: 100, reward: '$500 + iPad Pro', rank: 'Bronze' },
          { threshold: 250, reward: '$1,500 + MacBook Pro', rank: 'Silver' },
          { threshold: 500, reward: '$5,000 + Tesla Model 3', rank: 'Gold' },
          { threshold: 1000, reward: '$10,000 + Luxury Watch', rank: 'Diamond' },
          { threshold: 2500, reward: '$25,000 + Dream Vacation', rank: 'Ruby' },
        ];

        // Find next milestone
        const nextMilestone = milestones.find(m => currentPairs < m.threshold);
        if (!nextMilestone) {
          return { 
            progress: 100, 
            nextReward: 'All Milestones Achieved!', 
            remaining: 0,
            nextRank: 'Ruby (Max)',
            pairs: currentPairs,
          };
        }

        const progress = (currentPairs / nextMilestone.threshold) * 100;
        const remaining = nextMilestone.threshold - currentPairs;

        return {
          progress: Math.min(progress, 100),
          nextReward: nextMilestone.reward,
          remaining: remaining,
          nextRank: nextMilestone.rank,
          pairs: currentPairs,
        };
      };

      const milestoneProgress = calculateMilestoneProgress();

      // Calculate real financial summary
      const financialSummary = {
        totalBalance: user.totalBalance,
        principalWalletBalance: user.wallets.principal.balance,
        incomeWalletBalance: user.wallets.income.balance,
        dailyEarnings: user.dailyEarnings,
        totalInvested: user.wallets.principal.totalDeposited,
        totalWithdrawn: user.wallets.income.totalWithdrawn,
        totalEarnings: user.wallets.income.balance + user.wallets.income.totalWithdrawn,
      };

      // Calculate referral statistics
      const totalReferrals = user.referral.referrals.length;
      const totalReferralEarnings = user.referral.totalReferralEarnings;

      // Calculate rank bonus based on team volume and rank
      let rankBonus = 0;
      const thirtyDayVolume = user.team.teamVolume.thirtyDayTotal || 0;
      
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
            totalInvestment: financialSummary.totalInvested,
            totalBalance: financialSummary.totalBalance,
            principalWalletBalance: financialSummary.principalWalletBalance,
            incomeWalletBalance: financialSummary.incomeWalletBalance,
            dailyEarnings: financialSummary.dailyEarnings,
            monthlyEarnings: financialSummary.dailyEarnings * 30,
            totalEarnings: financialSummary.totalEarnings,
            availableForWithdrawal: financialSummary.incomeWalletBalance,
            principalLocked: user.wallets.principal.locked,
            lockExpiry: user.wallets.principal.lockExpiry,
            currentROIRate: user.programData.enhancedROI.qualified ? 
              user.programData.enhancedROI.rate : 0.75,
          },

          // Wallet Details
          wallets: {
            principal: {
              balance: financialSummary.principalWalletBalance,
              locked: user.wallets.principal.locked,
              lockExpiry: user.wallets.principal.lockExpiry,
              totalDeposited: financialSummary.totalInvested,
              canWithdraw: !user.wallets.principal.locked,
            },
            income: {
              balance: financialSummary.incomeWalletBalance,
              totalEarned: financialSummary.totalEarnings,
              totalWithdrawn: financialSummary.totalWithdrawn,
              canWithdraw: financialSummary.incomeWalletBalance >= 50,
              compoundingActive: !!user.wallets.income.compoundingStart,
              compoundingRate: user.wallets.income.compoundingRate,
            },
          },

          // Investment Details (Legacy + Current)
          investments: investmentStats,

          // Referral System
          referrals: {
            totalReferrals,
            totalReferralEarnings,
            directReferrals: teamStats.directReferrals,
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
            pairs: user.team.pairs,
            leftTeamVolume: teamStats.leftLegVolume,
            rightTeamVolume: teamStats.rightLegVolume,
            totalTeamVolume: teamStats.totalVolume,
            thirtyDayVolume: teamStats.totalVolume,
            rankBonus,
            nextMilestone: milestoneProgress,
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

  // Create new investment (Updated for Program I - $500 minimum)
  createInvestment: async (req, res) => {
    try {
      const { amount, walletAddress } = req.body;

      // Validate amount - Program I minimum is $500
      if (!amount || amount < 500) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum investment amount for Program I is $500',
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

      // Create investment transaction
      const currentDate = new Date();
      const lockExpiry = new Date(currentDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months

      // Add to principal wallet
      user.wallets.principal.balance += amount;
      user.wallets.principal.totalDeposited += amount;
      
      // Set lock expiry if this is first deposit
      if (!user.wallets.principal.lockExpiry || user.wallets.principal.lockExpiry < lockExpiry) {
        user.wallets.principal.lockExpiry = lockExpiry;
      }

      // Create new investment record
      const newInvestment = {
        amount: amount,
        program: 'Program I',
        startDate: currentDate,
        principalWallet: {
          balance: amount,
          lockedUntil: lockExpiry,
        },
        incomeWallet: {
          balance: 0,
          totalEarned: 0,
        },
        dailyROI: 0.75, // Program I base ROI
        status: 'active',
        lastROIDate: currentDate,
      };

      user.investments.push(newInvestment);

      // Add transaction record
      user.transactions.push({
        type: 'deposit',
        amount: amount,
        walletType: 'principal',
        description: `Program I investment of $${amount}`,
        status: 'completed',
        date: currentDate,
      });

      // Update wallet address if provided
      if (walletAddress !== user.walletAddress) {
        user.walletAddress = walletAddress;
      }

      // Update program data
      user.programData.currentProgram = 'Program I';

      await user.save();

      res.status(201).json({
        status: 'success',
        message: 'Investment processed successfully',
        data: {
          investmentId: newInvestment._id,
          amount: amount,
          program: 'Program I',
          walletAddress: walletAddress,
          principalBalance: user.wallets.principal.balance,
          totalBalance: user.totalBalance,
          dailyROI: 0.75,
          lockExpiry: lockExpiry,
          startDate: currentDate,
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

  // Reset user data to clean state (remove fake demo data)
  resetUserData: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Reset wallets to zero
      user.wallets.principal.balance = 0;
      user.wallets.principal.totalDeposited = 0;
      user.wallets.principal.locked = false; // No money = no lock needed
      user.wallets.principal.lockExpiry = null;

      user.wallets.income.balance = 0;
      user.wallets.income.totalEarned = 0;
      user.wallets.income.totalWithdrawn = 0;
      user.wallets.income.compoundingStart = null;
      user.wallets.income.compoundingRate = 0;
      user.wallets.income.lastCompoundDate = null;

      // Clear investments
      user.investments = [];

      // Reset referral earnings
      user.referral.totalReferralEarnings = 0;
      user.referral.directReferrals = 0;

      // Reset team data
      user.team.leftSide = [];
      user.team.rightSide = [];
      user.team.teamVolume.left = 0;
      user.team.teamVolume.right = 0;
      user.team.teamVolume.total = 0;
      user.team.teamVolume.thirtyDayLeft = 0;
      user.team.teamVolume.thirtyDayRight = 0;
      user.team.teamVolume.thirtyDayTotal = 0;
      user.team.rank = 'Bronze';
      user.team.pairs = 0;

      // Reset matching bonus
      user.team.matchingBonus.totalEarned = 0;
      user.team.matchingBonus.todayEarned = 0;

      // Reset MLM earnings
      user.mlmEarnings.levelOverrides.totalEarned = 0;
      user.mlmEarnings.levelOverrides.byLevel = [];
      user.mlmEarnings.leadershipPools.totalEarned = 0;
      user.mlmEarnings.leadershipPools.monthlyEarnings = [];
      user.mlmEarnings.milestoneRewards.achieved = [];
      user.mlmEarnings.milestoneRewards.totalValue = 0;

      // Reset program data
      user.programData.enhancedROI.qualified = false;
      user.programData.enhancedROI.rate = 0.75;
      user.programData.enhancedROI.qualificationDate = null;

      // Clear transactions (keep only registration-related if any)
      user.transactions = [];

      // Add a clean slate transaction
      user.transactions.push({
        type: 'deposit',
        amount: 0,
        walletType: 'principal',
        description: 'Account reset to clean state',
        status: 'completed',
        date: new Date(),
      });

      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'User data reset to clean state successfully',
        data: {
          principalBalance: 0,
          incomeBalance: 0,
          totalBalance: 0,
          totalInvested: 0,
          dailyEarnings: 0,
          rank: 'Bronze',
          referrals: 0,
          teamVolume: 0,
        },
      });
    } catch (error) {
      console.error('Reset user data error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reset user data',
      });
    }
  },
};

module.exports = dashboardController;