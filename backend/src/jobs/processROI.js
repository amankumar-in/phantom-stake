const cron = require('node-cron');
const Stake = require('../models/Stake');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const compoundingService = require('../services/compoundingService');

// Process daily ROI at midnight UTC
const processROI = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Starting daily processing at', new Date().toISOString());
    
    try {
      // Step 1: Update days without withdrawal for all users
      console.log('Updating days without withdrawal...');
      const withdrawalUpdate = await compoundingService.updateDaysWithoutWithdrawal();
      console.log(`Updated ${withdrawalUpdate.processed} users, activated compounding for ${withdrawalUpdate.activated}`);
      
      // Step 2: Process ROI for all active stakes
      console.log('Processing ROI payments...');
      const activeStakes = await Stake.find({ status: 'active' });
      
      let totalProcessed = 0;
      let totalAmount = 0;
      
      for (const stake of activeStakes) {
        try {
          // Calculate daily ROI
          const roiAmount = stake.calculateDailyROI();
          
          if (roiAmount > 0) {
            // Update user's income wallet
            const user = await User.findById(stake.userId);
            if (user) {
              user.wallets.income.balance += roiAmount;
              user.wallets.income.totalEarned += roiAmount;
              await user.save();
              
              // Update stake record
              stake.totalROIEarned += roiAmount;
              stake.lastROIDate = new Date();
              await stake.save();
              
              // Create transaction
              await Transaction.create({
                userId: stake.userId,
                type: 'roi',
                category: 'income',
                amount: roiAmount,
                description: `Daily ROI at ${stake.actualROIRate * 100}%`,
                relatedId: stake._id,
                status: 'completed'
              });
              
              totalProcessed++;
              totalAmount += roiAmount;
            }
          }
        } catch (error) {
          console.error(`Error processing ROI for stake ${stake._id}:`, error);
        }
      }
      
      console.log(`Processed ROI for ${totalProcessed} stakes, total amount: $${totalAmount.toFixed(2)}`);
      
      // Step 3: Process compounding for eligible users
      console.log('Processing compounding...');
      const compoundingResult = await compoundingService.processAllCompounding();
      console.log(`Processed compounding for ${compoundingResult.processed} users, total compounded: $${compoundingResult.totalCompounded.toFixed(2)}`);
      
      // Step 4: Process matching bonuses
      console.log('Processing matching bonuses...');
      const mlmService = require('../services/mlmService');
      await mlmService.processDailyMatchingBonuses();
      
      console.log('Daily processing completed at', new Date().toISOString());
    } catch (error) {
      console.error('Error in daily processing:', error);
    }
  });
  
  console.log('✅ Daily processing job scheduled for 00:00 UTC');
};

// Manual trigger for testing
const processROIManually = async () => {
  console.log('Starting manual ROI processing...');
  
  try {
    // Update days without withdrawal
    const withdrawalUpdate = await compoundingService.updateDaysWithoutWithdrawal();
    
    // Process ROI
    const activeStakes = await Stake.find({ status: 'active' });
    let totalProcessed = 0;
    let totalAmount = 0;
    
    for (const stake of activeStakes) {
      try {
        const roiAmount = stake.calculateDailyROI();
        
        if (roiAmount > 0) {
          const user = await User.findById(stake.userId);
          if (user) {
            user.wallets.income.balance += roiAmount;
            user.wallets.income.totalEarned += roiAmount;
            await user.save();
            
            stake.totalROIEarned += roiAmount;
            stake.lastROIDate = new Date();
            await stake.save();
            
            await Transaction.create({
              userId: stake.userId,
              type: 'roi',
              category: 'income',
              amount: roiAmount,
              description: `Daily ROI at ${stake.actualROIRate * 100}%`,
              relatedId: stake._id,
              status: 'completed'
            });
            
            totalProcessed++;
            totalAmount += roiAmount;
          }
        }
      } catch (error) {
        console.error(`Error processing ROI for stake ${stake._id}:`, error);
      }
    }
    
    // Process compounding
    const compoundingResult = await compoundingService.processAllCompounding();
    
    // Process matching bonuses
    const mlmService = require('../services/mlmService');
    await mlmService.processDailyMatchingBonuses();
    
    return {
      totalProcessed,
      totalAmount,
      compounding: compoundingResult,
      withdrawalUpdate
    };
  } catch (error) {
    console.error('Error in manual ROI processing:', error);
    throw error;
  }
};

module.exports = { processROI, processROIManually }; 