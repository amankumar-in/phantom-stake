const User = require('../models/User');
const Transaction = require('../models/Transaction');

const compoundingService = {
  // Check and activate compounding for eligible users
  checkCompoundingEligibility: async function(userId) {
    const user = await User.findById(userId);
    if (!user) return { eligible: false, reason: 'User not found' };
    
    const incomeWallet = user.wallets.income;
    
    // Check minimum balance (50 USDT for Program I)
    if (incomeWallet.balance < 50) {
      return { eligible: false, reason: 'Income wallet balance below 50 USDT minimum' };
    }
    
    // Check days without withdrawal
    if (incomeWallet.daysWithoutWithdrawal < 7) {
      return { 
        eligible: false, 
        reason: `Only ${incomeWallet.daysWithoutWithdrawal} days without withdrawal, need 7 days`,
        daysRemaining: 7 - incomeWallet.daysWithoutWithdrawal
      };
    }
    
    // Eligible for compounding
    return { eligible: true, canActivate: !incomeWallet.compounding.active };
  },
  
  // Activate compounding for a user
  activateCompounding: async function(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const eligibility = await this.checkCompoundingEligibility(userId);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }
    
    if (user.wallets.income.compounding.active) {
      return { success: true, message: 'Compounding already active' };
    }
    
    // Activate compounding
    user.wallets.income.compounding.active = true;
    user.wallets.income.compounding.startDate = new Date();
    
    await user.save();
    
    // Create transaction record
    await Transaction.create({
      userId: userId,
      type: 'compounding_activated',
      category: 'income',
      amount: 0,
      description: 'Compounding activated on income wallet',
      status: 'completed'
    });
    
    return { 
      success: true, 
      message: 'Compounding activated successfully',
      startDate: user.wallets.income.compounding.startDate,
      rate: user.wallets.income.compounding.rate
    };
  },
  
  // Process daily compounding for a user
  processCompounding: async function(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const incomeWallet = user.wallets.income;
    
    // Check if compounding is active
    if (!incomeWallet.compounding.active) {
      return { processed: false, reason: 'Compounding not active' };
    }
    
    // Check if already compounded today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (incomeWallet.compounding.lastCompoundDate && 
        incomeWallet.compounding.lastCompoundDate >= today) {
      return { processed: false, reason: 'Already compounded today' };
    }
    
    // Calculate compound amount (1.0% of entire income wallet)
    const compoundAmount = incomeWallet.balance * incomeWallet.compounding.rate;
    
    if (compoundAmount > 0) {
      // Add to income wallet
      incomeWallet.balance += compoundAmount;
      incomeWallet.totalEarned += compoundAmount;
      incomeWallet.compounding.totalCompounded += compoundAmount;
      incomeWallet.compounding.lastCompoundDate = new Date();
      
      await user.save();
      
      // Create transaction record
      await Transaction.create({
        userId: userId,
        type: 'compounding',
        category: 'income',
        amount: compoundAmount,
        description: `Daily compounding at ${incomeWallet.compounding.rate * 100}%`,
        status: 'completed'
      });
      
      // Process level overrides on compound earnings
      const mlmService = require('./mlmService');
      await mlmService.processLevelOverrides(userId, 'compounding', compoundAmount);
      
      return { 
        processed: true, 
        amount: compoundAmount,
        newBalance: incomeWallet.balance 
      };
    }
    
    return { processed: false, reason: 'No balance to compound' };
  },
  
  // Break compounding on withdrawal
  breakCompounding: async function(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const incomeWallet = user.wallets.income;
    
    // Reset compounding
    incomeWallet.compounding.active = false;
    incomeWallet.daysWithoutWithdrawal = 0;
    incomeWallet.lastWithdrawalDate = new Date();
    
    await user.save();
    
    // Create transaction record if compounding was active
    if (incomeWallet.compounding.active) {
      await Transaction.create({
        userId: userId,
        type: 'compounding_broken',
        category: 'income',
        amount: 0,
        description: 'Compounding broken due to withdrawal',
        status: 'completed'
      });
    }
    
    return { success: true, message: 'Compounding reset due to withdrawal' };
  },
  
  // Update days without withdrawal for all users
  updateDaysWithoutWithdrawal: async function() {
    const users = await User.find({ isActive: true });
    let updated = 0;
    
    for (const user of users) {
      const incomeWallet = user.wallets.income;
      
      // If no withdrawal date set, use account creation date
      if (!incomeWallet.lastWithdrawalDate) {
        incomeWallet.lastWithdrawalDate = user.createdAt;
      }
      
      // Calculate days since last withdrawal
      const daysSinceWithdrawal = Math.floor(
        (new Date() - incomeWallet.lastWithdrawalDate) / (1000 * 60 * 60 * 24)
      );
      
      incomeWallet.daysWithoutWithdrawal = daysSinceWithdrawal;
      
      // Auto-activate compounding on Day 8 if eligible
      if (daysSinceWithdrawal >= 7 && 
          !incomeWallet.compounding.active && 
          incomeWallet.balance >= 50) {
        await this.activateCompounding(user._id);
        updated++;
      }
      
      await user.save();
    }
    
    return { processed: users.length, activated: updated };
  },
  
  // Process all active compounding accounts
  processAllCompounding: async function() {
    const users = await User.find({
      isActive: true,
      'wallets.income.compounding.active': true
    });
    
    let processed = 0;
    let totalCompounded = 0;
    
    for (const user of users) {
      try {
        const result = await this.processCompounding(user._id);
        if (result.processed) {
          processed++;
          totalCompounded += result.amount;
        }
      } catch (error) {
        console.error(`Error processing compounding for user ${user._id}:`, error);
      }
    }
    
    return { 
      totalUsers: users.length, 
      processed, 
      totalCompounded 
    };
  }
};

module.exports = compoundingService; 