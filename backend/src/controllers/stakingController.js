const mongoose = require('mongoose');
const Stake = require('../models/Stake');
const ROIPayment = require('../models/ROIPayment');
const User = require('../models/User');
const mlmService = require('../services/mlmService');

// Create new stake
const createStake = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stake amount is $500 USDT'
      });
    }

    // Check if user has sufficient balance in principal wallet
    const user = await User.findById(userId);
    if (user.wallets.principal.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance in principal wallet'
      });
    }

    // Create new stake
    const stake = new Stake({
      userId,
      amount,
      program: 'I', // Currently Program I
      roiRate: 0.0075, // 0.75% base rate for Program I
    });

    // Check enhanced ROI qualification immediately
    await stake.checkEnhancedROIQualification();

    // Deduct amount from principal wallet
    user.wallets.principal.balance -= amount;
    user.wallets.principal.totalStaked += amount;

    await stake.save();
    await user.save();

    // Update MLM volumes and process overrides
    try {
      // Update personal volume in binary tree
      await mlmService.updatePersonalVolume(userId, amount);
      
      // Process level overrides for this deposit
      await mlmService.processLevelOverrides(userId, 'deposit', amount);
    } catch (mlmError) {
      console.error('MLM processing error:', mlmError);
      // Continue even if MLM processing fails
    }

    res.json({
      success: true,
      message: 'Stake created successfully',
      data: {
        stake: {
          id: stake._id,
          amount: stake.amount,
          roiRate: stake.enhancedROI.qualified ? stake.enhancedROI.rate : stake.roiRate,
          enhancedROI: stake.enhancedROI.qualified,
          program: stake.program,
          createdAt: stake.createdAt,
        }
      }
    });
  } catch (error) {
    console.error('Create stake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating stake'
    });
  }
};

// Get active stakes for user
const getActiveStakes = async (req, res) => {
  try {
    const userId = req.user._id;

    const stakes = await Stake.find({ 
      userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    const stakesWithProjections = stakes.map(stake => ({
      id: stake._id,
      amount: stake.amount,
      currentROIRate: stake.enhancedROI.qualified ? stake.enhancedROI.rate : stake.roiRate,
      enhancedROI: stake.enhancedROI.qualified,
      compounding: stake.compounding.active,
      compoundingDay: stake.compounding.daysWithoutWithdrawal,
      totalROIEarned: stake.totalROIEarned,
      lastROIDate: stake.lastROIDate,
      dailyROI: stake.calculateDailyROI(),
      program: stake.program,
      createdAt: stake.createdAt,
      projectedMonthlyROI: stake.calculateDailyROI() * 30,
      projectedYearlyROI: stake.calculateDailyROI() * 365,
    }));

    res.json({
      success: true,
      data: {
        stakes: stakesWithProjections,
        totalStaked: stakes.reduce((sum, stake) => sum + stake.amount, 0),
        totalDailyROI: stakes.reduce((sum, stake) => sum + stake.calculateDailyROI(), 0),
      }
    });
  } catch (error) {
    console.error('Get active stakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stakes'
    });
  }
};

// Calculate ROI projections
const calculateROIProjections = async (req, res) => {
  try {
    const { amount, days = 30 } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least $500'
      });
    }

    // Check if user qualifies for enhanced ROI
    const user = await User.findById(userId).populate('referrals');
    const allStakes = await Stake.find({ userId, isActive: true });
    const totalStakeAmount = allStakes.reduce((sum, stake) => sum + stake.amount, 0);
    
    let roiRate = 0.0075; // Base 0.75% for Program I
    let enhancedQualified = false;

    // Check enhanced ROI qualification (≥5K total stake + ≥1 ref ≥1K)
    if (totalStakeAmount + amount >= 5000) {
      const qualifiedReferrals = await Stake.find({
        userId: { $in: user.referrals.map(r => r._id) },
        amount: { $gte: 1000 },
        isActive: true,
      });
      
      if (qualifiedReferrals.length >= 1) {
        roiRate = 0.0085; // Enhanced 0.85%
        enhancedQualified = true;
      }
    }

    // Calculate projections
    const dailyROI = amount * roiRate;
    const totalROI = dailyROI * days;
    
    // Calculate compounding scenario (Day 8 trigger for Program I)
    let compoundingROI = 0;
    if (days >= 8) {
      // First 7 days: regular ROI
      const regularDays = 7;
      const regularROI = dailyROI * regularDays;
      
      // Remaining days: compounding at 1.0%
      const compoundingDays = days - 7;
      let compoundingBalance = amount + regularROI; // Income wallet balance after 7 days
      const compoundingRate = 0.01; // 1.0% compounding rate
      
      for (let day = 1; day <= compoundingDays; day++) {
        const dayROI = compoundingBalance * compoundingRate;
        compoundingBalance += dayROI;
        compoundingROI += dayROI;
      }
    }

    res.json({
      success: true,
      data: {
        projections: {
          stakeAmount: amount,
          days,
          roiRate: roiRate * 100, // Convert to percentage
          enhancedROI: enhancedQualified,
          dailyROI,
          totalROI,
          finalBalance: amount + totalROI,
          
          // Compounding scenario
          compounding: {
            available: days >= 8,
            triggerDay: 8,
            compoundingRate: 1.0, // 1.0%
            compoundingROI,
            totalWithCompounding: totalROI + compoundingROI,
            finalBalanceWithCompounding: amount + totalROI + compoundingROI,
          },
          
          // Performance metrics
          percentageGain: ((totalROI / amount) * 100).toFixed(2),
          breakEvenDays: Math.ceil(amount / dailyROI),
          monthlyROI: dailyROI * 30,
          yearlyROI: dailyROI * 365,
        }
      }
    });
  } catch (error) {
    console.error('Calculate ROI projections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating projections'
    });
  }
};

// Get ROI history for user
const getROIHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;

    const roiHistory = await ROIPayment.find({ userId })
      .populate('stakeId', 'amount program')
      .sort({ paymentDate: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit);

    const totalStats = await ROIPayment.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          paymentCount: { $sum: 1 },
          avgDailyROI: { $avg: '$amount' },
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        history: roiHistory,
        statistics: totalStats[0] || {
          totalEarnings: 0,
          paymentCount: 0,
          avgDailyROI: 0,
        }
      }
    });
  } catch (error) {
    console.error('Get ROI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ROI history'
    });
  }
};

// Check enhanced ROI status for user
const checkEnhancedROIStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('referrals');
    const allStakes = await Stake.find({ userId, isActive: true });
    
    const totalStakeAmount = allStakes.reduce((sum, stake) => sum + stake.amount, 0);
    const qualifiedStakes = allStakes.filter(stake => stake.enhancedROI.qualified);

    // Check referral requirements
    const qualifiedReferrals = await Stake.find({
      userId: { $in: user.referrals.map(r => r._id) },
      amount: { $gte: 1000 },
      isActive: true,
    });

    const requirements = {
      totalStakeRequired: 5000,
      currentTotalStake: totalStakeAmount,
      stakeRequirementMet: totalStakeAmount >= 5000,
      
      qualifiedReferralsRequired: 1,
      currentQualifiedReferrals: qualifiedReferrals.length,
      referralRequirementMet: qualifiedReferrals.length >= 1,
      
      overallQualified: totalStakeAmount >= 5000 && qualifiedReferrals.length >= 1,
    };

    const benefits = {
      baseROI: 0.75, // 0.75%
      enhancedROI: 0.85, // 0.85%
      improvementPercentage: ((0.85 - 0.75) / 0.75 * 100).toFixed(1), // 13.3% improvement
      additionalDailyEarnings: totalStakeAmount * (0.0085 - 0.0075),
      additionalMonthlyEarnings: totalStakeAmount * (0.0085 - 0.0075) * 30,
    };

    res.json({
      success: true,
      data: {
        requirements,
        benefits,
        qualifiedStakes: qualifiedStakes.length,
        totalActiveStakes: allStakes.length,
        qualifiedReferralDetails: qualifiedReferrals.map(stake => ({
          amount: stake.amount,
          userId: stake.userId,
        })),
      }
    });
  } catch (error) {
    console.error('Check enhanced ROI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking enhanced ROI status'
    });
  }
};

// Process daily ROI for all active stakes
const processDailyROI = async (req, res) => {
  try {
    const allActiveStakes = await Stake.find({ isActive: true });
    const results = [];

    for (const stake of allActiveStakes) {
      try {
        const roiAmount = await stake.processROIPayment();
        
        if (roiAmount > 0) {
          // Create ROI payment record
          const roiPayment = new ROIPayment({
            userId: stake.userId,
            stakeId: stake._id,
            amount: roiAmount,
            roiRate: stake.compounding.active ? stake.compounding.rate : 
                    (stake.enhancedROI.qualified ? stake.enhancedROI.rate : stake.roiRate),
            paymentType: stake.compounding.active ? 'compounding' : 
                        (stake.enhancedROI.qualified ? 'enhanced_roi' : 'base_roi'),
            program: stake.program,
            compoundingDay: stake.compounding.active ? stake.compounding.daysWithoutWithdrawal : 0,
          });
          
          await roiPayment.save();
          
          // Process level overrides for daily ROI
          try {
            await mlmService.processLevelOverrides(stake.userId, 'daily_roi', roiAmount);
          } catch (mlmError) {
            console.error(`MLM override processing error for stake ${stake._id}:`, mlmError);
          }
          
          results.push({
            userId: stake.userId,
            stakeId: stake._id,
            amount: roiAmount,
            paymentType: roiPayment.paymentType,
          });
        }
      } catch (error) {
        console.error(`Error processing ROI for stake ${stake._id}:`, error);
      }
    }

    // Process daily matching bonuses for all users
    try {
      await mlmService.processDailyMatchingBonuses();
    } catch (matchingError) {
      console.error('Error processing daily matching bonuses:', matchingError);
    }

    res.json({
      success: true,
      message: `Processed ROI for ${results.length} stakes`,
      data: {
        processedStakes: results.length,
        totalROIPaid: results.reduce((sum, r) => sum + r.amount, 0),
        details: results,
      }
    });
  } catch (error) {
    console.error('Process daily ROI error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing daily ROI'
    });
  }
};

module.exports = {
  createStake,
  getActiveStakes,
  calculateROIProjections,
  getROIHistory,
  checkEnhancedROIStatus,
  processDailyROI,
};