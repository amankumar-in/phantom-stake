const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { processROIManually } = require('../jobs/processROI');
const { processLeadershipPoolsManually } = require('../jobs/processLeadershipPools');
const User = require('../models/User');

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Dashboard routes
router.get('/', dashboardController.getDashboard);
router.post('/invest', dashboardController.createInvestment);
router.post('/withdraw', dashboardController.withdrawIncome);
router.post('/reset', dashboardController.resetUserData);

// Get leadership pool data
router.get('/pools', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Get current month's pool data
    const LeadershipPool = require('../models/LeadershipPool');
    const currentPool = await LeadershipPool.getCurrentPool('I');
    
    if (!currentPool) {
      return res.status(404).json({
        status: 'error',
        message: 'No pool data available',
      });
    }
    
    // Calculate current distribution
    await currentPool.calculateDistribution();
    
    // Get user's pool history
    const Transaction = require('../models/Transaction');
    const poolHistory = await Transaction.find({
      userId: user._id,
      type: 'leadership_pool'
    })
    .sort({ createdAt: -1 })
    .limit(12);
    
    const history = poolHistory.map(tx => {
      const monthDate = new Date(tx.createdAt);
      return {
        month: monthDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        rank: tx.description.match(/(\w+) leadership pool/)?.[1] || 'Unknown',
        amount: tx.amount,
        poolPercentage: tx.description.includes('Silver') ? 0.5 :
                       tx.description.includes('Gold') ? 1.0 :
                       tx.description.includes('Diamond') ? 1.5 :
                       tx.description.includes('Ruby') ? 2.0 : 0,
      };
    });
    
    // Determine user's eligibility
    const userRank = user.team.rank;
    const qualified = userRank !== 'Bronze' && user.wallets.principal.balance >= 
      (userRank === 'Silver' ? 1000 :
       userRank === 'Gold' ? 2500 :
       userRank === 'Diamond' ? 5000 :
       userRank === 'Ruby' ? 10000 : 0);
    
    const poolPercentage = userRank === 'Silver' ? 0.5 :
                          userRank === 'Gold' ? 1.0 :
                          userRank === 'Diamond' ? 1.5 :
                          userRank === 'Ruby' ? 2.0 : 0;
    
    const estimatedShare = qualified && userRank !== 'Bronze' ? 
      currentPool.pools[userRank.toLowerCase()]?.perMemberShare || 0 : 0;
    
    res.json({
      status: 'success',
      data: {
        currentPool: {
          month: currentPool.month.toLocaleString('default', { month: 'long', year: 'numeric' }),
          totalDeposits: currentPool.totalDeposits,
          pools: {
            silver: {
              total: currentPool.pools.silver.totalAmount,
              members: currentPool.pools.silver.qualifiedMembers,
              perMember: currentPool.pools.silver.perMemberShare
            },
            gold: {
              total: currentPool.pools.gold.totalAmount,
              members: currentPool.pools.gold.qualifiedMembers,
              perMember: currentPool.pools.gold.perMemberShare
            },
            diamond: {
              total: currentPool.pools.diamond.totalAmount,
              members: currentPool.pools.diamond.qualifiedMembers,
              perMember: currentPool.pools.diamond.perMemberShare
            },
            ruby: {
              total: currentPool.pools.ruby.totalAmount,
              members: currentPool.pools.ruby.qualifiedMembers,
              perMember: currentPool.pools.ruby.perMemberShare
            }
          }
        },
        userRank,
        eligibility: {
          qualified,
          rank: userRank,
          poolPercentage,
          estimatedShare
        },
        history
      }
    });
  } catch (error) {
    console.error('Error fetching pool data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pool data',
    });
  }
});

// Manual ROI processing (for testing)
router.post('/process-roi', async (req, res) => {
  try {
    const result = await processROIManually();
    res.json({
      status: 'success',
      message: 'ROI processed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process ROI',
      error: error.message
    });
  }
});

// Manual leadership pool processing (for testing)
router.post('/process-pool', async (req, res) => {
  try {
    const result = await processLeadershipPoolsManually();
    res.json({
      status: 'success',
      message: 'Leadership pool processed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process leadership pool',
      error: error.message
    });
  }
});

module.exports = router;