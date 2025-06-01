const cron = require('node-cron');
const LeadershipPool = require('../models/LeadershipPool');

// Process leadership pools on the 1st of each month at 00:00 UTC
const processLeadershipPools = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Starting monthly leadership pool distribution at', new Date().toISOString());
    
    try {
      // Get previous month's pool
      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const pool = await LeadershipPool.findOne({
        program: 'I',
        month: previousMonth,
        status: { $ne: 'distributed' }
      });
      
      if (!pool) {
        console.log('No pool to distribute for previous month');
        return;
      }
      
      console.log(`Processing pool for ${previousMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
      console.log(`Total deposits: $${pool.totalDeposits.toLocaleString()}`);
      
      // Calculate distribution
      await pool.calculateDistribution();
      
      console.log('Pool distribution calculated:');
      console.log(`- Silver: ${pool.pools.silver.qualifiedMembers} members, $${pool.pools.silver.perMemberShare.toFixed(2)} each`);
      console.log(`- Gold: ${pool.pools.gold.qualifiedMembers} members, $${pool.pools.gold.perMemberShare.toFixed(2)} each`);
      console.log(`- Diamond: ${pool.pools.diamond.qualifiedMembers} members, $${pool.pools.diamond.perMemberShare.toFixed(2)} each`);
      console.log(`- Ruby: ${pool.pools.ruby.qualifiedMembers} members, $${pool.pools.ruby.perMemberShare.toFixed(2)} each`);
      
      // Distribute to members
      await pool.distribute();
      
      console.log('Leadership pool distribution completed');
    } catch (error) {
      console.error('Error processing leadership pools:', error);
    }
  });
  
  console.log('✅ Leadership pool distribution job scheduled for 1st of each month at 00:00 UTC');
};

// Manual trigger for testing
const processLeadershipPoolsManually = async () => {
  console.log('Starting manual leadership pool processing...');
  
  try {
    // Get current month's pool (for testing)
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const pool = await LeadershipPool.findOne({
      program: 'I',
      month: currentMonth
    });
    
    if (!pool) {
      return { error: 'No pool found for current month' };
    }
    
    // Calculate distribution
    await pool.calculateDistribution();
    
    const result = {
      month: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalDeposits: pool.totalDeposits,
      pools: {
        silver: {
          total: pool.pools.silver.totalAmount,
          members: pool.pools.silver.qualifiedMembers,
          perMember: pool.pools.silver.perMemberShare
        },
        gold: {
          total: pool.pools.gold.totalAmount,
          members: pool.pools.gold.qualifiedMembers,
          perMember: pool.pools.gold.perMemberShare
        },
        diamond: {
          total: pool.pools.diamond.totalAmount,
          members: pool.pools.diamond.qualifiedMembers,
          perMember: pool.pools.diamond.perMemberShare
        },
        ruby: {
          total: pool.pools.ruby.totalAmount,
          members: pool.pools.ruby.qualifiedMembers,
          perMember: pool.pools.ruby.perMemberShare
        }
      }
    };
    
    // Distribute if ready
    if (pool.status === 'ready') {
      await pool.distribute();
      result.distributed = true;
    } else {
      result.distributed = false;
    }
    
    return result;
  } catch (error) {
    console.error('Error in manual pool processing:', error);
    throw error;
  }
};

module.exports = { processLeadershipPools, processLeadershipPoolsManually }; 