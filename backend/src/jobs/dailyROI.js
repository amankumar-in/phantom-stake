const cron = require('node-cron');
const Stake = require('../models/Stake');
const ROIPayment = require('../models/ROIPayment');
const User = require('../models/User');

/**
 * Daily ROI Processing Job
 * Runs every day at 00:00 UTC (midnight)
 * Processes ROI payments for all active stakes
 */
const processDailyROI = async () => {
  console.log('🔄 Starting daily ROI processing...');
  
  try {
    const startTime = new Date();
    const allActiveStakes = await Stake.find({ isActive: true }).populate('userId', 'email');
    
    let processedCount = 0;
    let totalROIPaid = 0;
    let errorCount = 0;
    const results = [];

    console.log(`📊 Found ${allActiveStakes.length} active stakes to process`);

    for (const stake of allActiveStakes) {
      try {
        // Check enhanced ROI qualification before processing
        await stake.checkEnhancedROIQualification();
        
        // Process ROI payment
        const roiAmount = await stake.processROIPayment();
        
        if (roiAmount > 0) {
          // Create ROI payment record
          const roiPayment = new ROIPayment({
            userId: stake.userId._id,
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
          
          processedCount++;
          totalROIPaid += roiAmount;
          
          results.push({
            userId: stake.userId._id,
            userEmail: stake.userId.email,
            stakeId: stake._id,
            stakeAmount: stake.amount,
            roiAmount,
            roiRate: roiPayment.roiRate,
            paymentType: roiPayment.paymentType,
          });

          console.log(`✅ Processed ROI for stake ${stake._id}: $${roiAmount.toFixed(2)} (${roiPayment.paymentType})`);
        } else {
          console.log(`⏭️ No ROI due for stake ${stake._id} (already paid today or inactive)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ROI for stake ${stake._id}:`, error.message);
      }
    }

    const endTime = new Date();
    const processingTime = (endTime - startTime) / 1000;

    // Log summary
    console.log('\n📈 Daily ROI Processing Summary:');
    console.log(`   • Processed Stakes: ${processedCount}/${allActiveStakes.length}`);
    console.log(`   • Total ROI Paid: $${totalROIPaid.toFixed(2)}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Processing Time: ${processingTime}s`);
    console.log(`   • Timestamp: ${endTime.toISOString()}\n`);

    // Update compounding day counters (increment days without withdrawal)
    await updateCompoundingCounters();

    return {
      success: true,
      processedStakes: processedCount,
      totalStakes: allActiveStakes.length,
      totalROIPaid,
      errorCount,
      processingTime,
      results,
    };
    
  } catch (error) {
    console.error('❌ Fatal error in daily ROI processing:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update compounding day counters
 * Increments daysWithoutWithdrawal for stakes that haven't withdrawn
 * Activates compounding for stakes that reach the threshold
 */
const updateCompoundingCounters = async () => {
  try {
    console.log('🔄 Updating compounding counters...');
    
    // Find stakes that are eligible for compounding tracking
    const stakes = await Stake.find({ 
      isActive: true,
      'compounding.active': false // Not already compounding
    });

    let activatedCount = 0;

    for (const stake of stakes) {
      // Check if user made any withdrawals today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const user = await User.findById(stake.userId);
      const lastWithdrawal = user.wallets.income.lastWithdrawal;
      
      // If no withdrawal today, increment counter
      if (!lastWithdrawal || lastWithdrawal < today) {
        stake.compounding.daysWithoutWithdrawal += 1;
        
        // Check if compounding should be activated (7 days for Program I)
        const compoundingThreshold = getCompoundingThreshold(stake.program);
        const minIncomeBalance = getMinIncomeBalance(stake.program);
        
        if (stake.compounding.daysWithoutWithdrawal >= compoundingThreshold && 
            user.wallets.income.balance >= minIncomeBalance) {
          stake.compounding.active = true;
          stake.compounding.startDate = new Date();
          activatedCount++;
          
          console.log(`🚀 Activated compounding for stake ${stake._id} after ${stake.compounding.daysWithoutWithdrawal} days`);
        }
        
        await stake.save();
      } else {
        // Reset counter if withdrawal was made
        if (stake.compounding.daysWithoutWithdrawal > 0) {
          stake.compounding.daysWithoutWithdrawal = 0;
          await stake.save();
          console.log(`🔄 Reset compounding counter for stake ${stake._id} (withdrawal detected)`);
        }
      }
    }

    console.log(`✅ Compounding update complete. Activated: ${activatedCount} stakes`);
    
  } catch (error) {
    console.error('❌ Error updating compounding counters:', error);
  }
};

/**
 * Get compounding threshold by program
 */
const getCompoundingThreshold = (program) => {
  const thresholds = {
    'I': 7,   // 7 days for Program I
    'II': 5,  // 5 days for Program II
    'III': 3, // 3 days for Program III
    'IV': 1,  // 1 day for Program IV
  };
  return thresholds[program] || 7;
};

/**
 * Get minimum income balance for compounding by program
 */
const getMinIncomeBalance = (program) => {
  const minimums = {
    'I': 50,    // $50 for Program I
    'II': 100,  // $100 for Program II
    'III': 200, // $200 for Program III
    'IV': 500,  // $500 for Program IV
  };
  return minimums[program] || 50;
};

/**
 * Manual ROI processing function (for testing or admin use)
 */
const manualROIProcessing = async () => {
  console.log('🔧 Manual ROI processing triggered');
  return await processDailyROI();
};

/**
 * Schedule the daily ROI cron job
 * Runs at 00:00 UTC every day
 */
const startDailyROICron = () => {
  // Run at 00:00 UTC every day
  cron.schedule('0 0 * * *', async () => {
    console.log('\n⏰ Scheduled daily ROI processing started at:', new Date().toISOString());
    await processDailyROI();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('📅 Daily ROI cron job scheduled for 00:00 UTC');
  
  // Also schedule compounding counter updates every hour
  cron.schedule('0 * * * *', async () => {
    await updateCompoundingCounters();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('📅 Hourly compounding counter update scheduled');
};

module.exports = {
  processDailyROI,
  manualROIProcessing,
  startDailyROICron,
  updateCompoundingCounters,
};