const cron = require('node-cron');
const Stake = require('../models/Stake');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Process daily ROI at midnight UTC
const processROI = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Starting daily ROI processing...');
    
    try {
      // Get all active stakes
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
              
              // Update compounding status
              const daysSinceLastWithdrawal = Math.floor(
                (Date.now() - (user.wallets.income.lastWithdrawalDate || user.createdAt)) / 
                (1000 * 60 * 60 * 24)
              );
              
              // Activate compounding after 7 days without withdrawal
              if (daysSinceLastWithdrawal >= 7 && !user.wallets.income.compoundingActive) {
                user.wallets.income.compoundingActive = true;
                user.wallets.income.compoundingRate = 0.01; // 1% daily when compounding
                
                // Update stake ROI rate for compounding
                stake.roiRate = stake.enhancedROI ? 0.011 : 0.01; // 1.1% or 1.0%
                stake.dailyROI = stake.amount * stake.roiRate;
                await stake.save();
              }
              
              await user.save();
              
              // Create transaction record
              const transaction = new Transaction({
                userId: stake.userId,
                type: 'roi',
                category: 'income',
                amount: roiAmount,
                currency: 'USDT',
                status: 'completed',
                description: `Daily ROI from stake ${stake._id}`,
                walletType: 'income',
                reference: `ROI-${stake._id}-${new Date().toISOString().split('T')[0]}`,
              });
              
              await transaction.save();
              
              // Update stake stats
              stake.totalROIEarned += roiAmount;
              stake.lastROIDate = new Date();
              await stake.save();
              
              totalProcessed++;
              totalAmount += roiAmount;
            }
          }
        } catch (error) {
          console.error(`Error processing ROI for stake ${stake._id}:`, error);
        }
      }
      
      console.log(`Daily ROI processing completed. Processed ${totalProcessed} stakes, total amount: $${totalAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error in daily ROI processing:', error);
    }
  });
  
  console.log('ROI processing job scheduled for midnight UTC daily');
};

// Function to manually trigger ROI processing (for testing)
const processROIManually = async () => {
  console.log('Manually triggering ROI processing...');
  
  try {
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
            
            const transaction = new Transaction({
              userId: stake.userId,
              type: 'roi',
              category: 'income',
              amount: roiAmount,
              currency: 'USDT',
              status: 'completed',
              description: `Daily ROI from stake ${stake._id}`,
              walletType: 'income',
              reference: `ROI-${stake._id}-${new Date().toISOString().split('T')[0]}`,
            });
            
            await transaction.save();
            
            stake.totalROIEarned += roiAmount;
            stake.lastROIDate = new Date();
            await stake.save();
            
            totalProcessed++;
            totalAmount += roiAmount;
          }
        }
      } catch (error) {
        console.error(`Error processing ROI for stake ${stake._id}:`, error);
      }
    }
    
    return { totalProcessed, totalAmount };
  } catch (error) {
    console.error('Error in manual ROI processing:', error);
    throw error;
  }
};

module.exports = { processROI, processROIManually }; 