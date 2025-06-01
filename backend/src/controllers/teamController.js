const User = require('../models/User');
const TreeNode = require('../models/TreeNode');
const MatchingBonus = require('../models/MatchingBonus');
const LevelOverride = require('../models/LevelOverride');
const mongoose = require('mongoose');

const teamController = {
  // Get comprehensive team overview
  getTeamOverview: async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Get user's tree node
      const userTreeNode = await TreeNode.findOne({ userId })
        .populate('userId', 'username firstName lastName wallets team programData');
        
      if (!userTreeNode) {
        return res.status(404).json({
          status: 'error',
          message: 'Binary tree data not found',
        });
      }

      // Get user data
      const user = await User.findById(userId);
      
      // Get matching bonus stats
      const matchingStats = await MatchingBonus.getTotalStats(userId);
      const todayMatching = await MatchingBonus.getTodayBonus(userId);
      const weeklyMatching = await MatchingBonus.getBonusHistory(userId, 7);
      
      // Get level override stats
      const overrideStats = await LevelOverride.getTotalEarnings(userId);
      const levelBreakdown = await LevelOverride.getStatsByLevel(userId);
      
      // Calculate rank progress
      const thirtyDayVolume = userTreeNode.leftLegVolume + userTreeNode.rightLegVolume;
      const rankProgress = calculateRankProgress(user.team.rank, thirtyDayVolume, user.wallets.principal.balance);
      
      // Get team members with proper referral and tree levels
      const teamMembers = await getTeamMembersWithLevels(userId);
      
      // Build response
      const response = {
        stats: {
          leftLegVolume: userTreeNode.leftLegVolume || 0,
          rightLegVolume: userTreeNode.rightLegVolume || 0,
          totalTeamSize: userTreeNode.totalTeamSize || 0,
          thirtyDayVolume: thirtyDayVolume,
          currentRank: user.team.rank || 'Bronze',
          pairsFormed: matchingStats.totalPairs || 0,
          matchingBonus: matchingStats.totalBonus || 0,
          dailyCapUsed: todayMatching?.dailyCapUsed || 0,
          dailyCapLimit: MatchingBonus.getDailyCapByRank(user.team.rank, user.programData.currentProgram),
          spilloverLeft: userTreeNode.spilloverLeft || 0,
          spilloverRight: userTreeNode.spilloverRight || 0,
          maxTreeDepth: await calculateMaxTreeDepth(userId),
        },
        matching: {
          todayPairs: todayMatching?.pairsFormed || 0,
          todayEarnings: todayMatching?.bonusAmount || 0,
          weeklyPairs: weeklyMatching.reduce((sum, m) => sum + m.pairsFormed, 0),
          weeklyEarnings: weeklyMatching.reduce((sum, m) => sum + m.bonusAmount, 0),
          totalPairs: matchingStats.totalPairs || 0,
          totalEarnings: matchingStats.totalBonus || 0,
        },
        rankProgress: rankProgress,
        members: teamMembers.slice(0, 10), // First 10 for overview
      };
      
      res.status(200).json({
        status: 'success',
        data: response,
      });
    } catch (error) {
      console.error('Team overview error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch team data',
        error: error.message,
      });
    }
  },

  // Get binary tree structure with lazy loading
  getBinaryTree: async (req, res) => {
    try {
      const { levels = 10 } = req.query;
      const userId = req.user._id;
      
      // Get root node
      const rootNode = await TreeNode.findOne({ userId })
        .populate('userId', 'username firstName lastName wallets team');
        
      if (!rootNode) {
        return res.status(404).json({
          status: 'error',
          message: 'Binary tree not found',
        });
      }
      
      // Build tree structure with specified levels
      const treeData = await buildTreeStructure(rootNode, parseInt(levels));
      
      res.status(200).json({
        status: 'success',
        data: {
          treeStructure: treeData,
          maxLoadedLevel: parseInt(levels),
        },
      });
    } catch (error) {
      console.error('Binary tree error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch binary tree',
        error: error.message,
      });
    }
  },

  // Expand tree - load more levels
  expandTree: async (req, res) => {
    try {
      const { parentId, levels = 5 } = req.body;
      
      const parentNode = await TreeNode.findById(parentId);
      if (!parentNode) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent node not found',
        });
      }
      
      const expandedData = await expandTreeFromNode(parentNode, parseInt(levels));
      
      res.status(200).json({
        status: 'success',
        data: expandedData,
      });
    } catch (error) {
      console.error('Tree expansion error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to expand tree',
        error: error.message,
      });
    }
  },

  // Get team members with filters
  getTeamMembers: async (req, res) => {
    try {
      const { 
        level = 'all', 
        sortBy = 'date', 
        search = '',
        page = 1,
        limit = 50
      } = req.query;
      
      const userId = req.user._id;
      
      // Get all team members with proper levels
      let members = await getTeamMembersWithLevels(userId);
      
      // Apply filters
      if (level !== 'all') {
        members = members.filter(m => m.referralLevel === parseInt(level));
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        members = members.filter(m => 
          m.firstName.toLowerCase().includes(searchLower) ||
          m.lastName.toLowerCase().includes(searchLower) ||
          m.username.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort members
      members = sortTeamMembers(members, sortBy);
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedMembers = members.slice(startIndex, endIndex);
      
      res.status(200).json({
        status: 'success',
        data: {
          members: paginatedMembers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(members.length / limit),
            totalMembers: members.length,
            hasNext: endIndex < members.length,
            hasPrev: startIndex > 0,
          },
        },
      });
    } catch (error) {
      console.error('Team members error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch team members',
        error: error.message,
      });
    }
  },

  // Get matching bonus details
  getMatchingDetails: async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const userId = req.user._id;
      
      const history = await MatchingBonus.getBonusHistory(userId, parseInt(days));
      const totalStats = await MatchingBonus.getTotalStats(userId);
      const todayBonus = await MatchingBonus.getTodayBonus(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          today: todayBonus,
          history: history,
          totalStats: totalStats,
        },
      });
    } catch (error) {
      console.error('Matching details error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch matching details',
        error: error.message,
      });
    }
  },

  // Get level override details
  getLevelOverrides: async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const userId = req.user._id;
      
      const history = await LevelOverride.getOverrideHistory(userId, parseInt(days));
      const levelStats = await LevelOverride.getStatsByLevel(userId);
      const totalStats = await LevelOverride.getTotalEarnings(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          history: history,
          levelBreakdown: levelStats,
          totalStats: totalStats,
        },
      });
    } catch (error) {
      console.error('Override details error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch override details',
        error: error.message,
      });
    }
  },

  // Get direct referrals (remains similar but enhanced)
  getDirectReferrals: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user._id;
      
      const user = await User.findById(userId)
        .populate({
          path: 'referral.referrals.user',
          select: 'username firstName lastName email wallets createdAt',
        });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Get tree nodes for volume data
      const referralIds = user.referral.referrals.map(r => r.user._id);
      const treeNodes = await TreeNode.find({ userId: { $in: referralIds } });
      const nodeMap = new Map(treeNodes.map(n => [n.userId.toString(), n]));

      // Enhance referral data with tree information
      const referralsData = user.referral.referrals.map(ref => {
        const treeNode = nodeMap.get(ref.user._id.toString());
        return {
          id: ref.user._id,
          username: ref.user.username,
          firstName: ref.user.firstName,
          lastName: ref.user.lastName,
          email: ref.user.email,
          dateReferred: ref.dateReferred,
          personalVolume: treeNode?.personalVolume || 0,
          leftLegVolume: treeNode?.leftLegVolume || 0,
          rightLegVolume: treeNode?.rightLegVolume || 0,
          teamSize: treeNode?.totalTeamSize || 0,
          treePosition: treeNode?.treePosition || '',
          commission: ref.commission,
          totalCommissionEarned: ref.totalCommissionEarned,
          totalInvestment: ref.user.wallets?.principal?.totalDeposited || 0,
          currentBalance: ref.user.wallets?.principal?.balance || 0,
          status: ref.user.wallets?.principal?.balance > 0 ? 'active' : 'inactive',
        };
      });

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedReferrals = referralsData.slice(startIndex, endIndex);

      res.status(200).json({
        status: 'success',
        data: {
          referrals: paginatedReferrals,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(referralsData.length / limit),
            totalReferrals: referralsData.length,
            hasNext: endIndex < referralsData.length,
            hasPrev: startIndex > 0,
          },
          summary: {
            totalReferrals: referralsData.length,
            activeReferrals: referralsData.filter(r => r.status === 'active').length,
            totalCommissions: user.referral.totalReferralEarnings,
            totalVolume: referralsData.reduce((sum, r) => sum + r.personalVolume, 0),
          },
        },
      });
    } catch (error) {
      console.error('Direct referrals error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch referral data',
        error: error.message,
      });
    }
  },

  // Get team analytics (enhanced)
  getTeamAnalytics: async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const userId = req.user._id;
      const periodDays = parseInt(period);
      
      // Get various analytics
      const volumeGrowth = await calculateVolumeGrowth(userId, periodDays);
      const topPerformers = await getTopPerformers(userId, 10);
      const levelDistribution = await getLevelDistribution(userId);
      const earningsProjection = await projectEarnings(userId, periodDays);
      
      res.status(200).json({
        status: 'success',
        data: {
          volumeGrowth,
          topPerformers,
          levelDistribution,
          earningsProjection,
          period: periodDays,
        },
      });
    } catch (error) {
      console.error('Team analytics error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch team analytics',
        error: error.message,
      });
    }
  },
};

// Helper functions

async function getTeamMembersWithLevels(userId) {
  // Get all nodes in user's tree
  const userNode = await TreeNode.findOne({ userId });
  if (!userNode) return [];
  
  // Use aggregation to get all descendants
  const descendants = await TreeNode.aggregate([
    {
      $match: {
        treePosition: { $regex: `^${userNode.treePosition}` },
        _id: { $ne: userNode._id }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        userId: '$userId',
        username: '$user.username',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        position: '$position',
        referralLevel: 1,
        treeNodeLevel: 1,
        personalVolume: 1,
        totalInvested: '$user.wallets.principal.totalDeposited',
        rank: '$user.team.rank',
        isActive: { $gt: ['$user.wallets.principal.balance', 0] },
        joinDate: '$user.createdAt',
        dailyROI: { $multiply: ['$user.wallets.principal.balance', 0.0075] }, // 0.75% daily
        parentId: 1,
        directReferrals: '$user.referral.directReferrals',
        teamSize: '$totalTeamSize',
        sponsorId: 1,
        leftChildId: 1,
        rightChildId: 1,
        treePosition: 1,
      }
    }
  ]);
  
  return descendants;
}

async function buildTreeStructure(rootNode, maxLevels) {
  const structure = {
    id: rootNode._id.toString(),
    userId: rootNode.userId._id || rootNode.userId,
    username: rootNode.userId.username || 'Unknown',
    firstName: rootNode.userId.firstName || '',
    lastName: rootNode.userId.lastName || '',
    position: rootNode.position,
    referralLevel: rootNode.referralLevel,
    treeNodeLevel: rootNode.treeNodeLevel,
    personalVolume: rootNode.personalVolume,
    leftLegVolume: rootNode.leftLegVolume,
    rightLegVolume: rootNode.rightLegVolume,
    totalTeamSize: rootNode.totalTeamSize,
    treePosition: rootNode.treePosition,
    isActive: rootNode.isActive,
    leftChild: null,
    rightChild: null,
  };
  
  if (rootNode.treeNodeLevel >= maxLevels) {
    structure.canExpand = !!(rootNode.leftChildId || rootNode.rightChildId);
    return structure;
  }
  
  // Load children
  if (rootNode.leftChildId) {
    const leftChild = await TreeNode.findById(rootNode.leftChildId)
      .populate('userId', 'username firstName lastName wallets team');
    if (leftChild) {
      structure.leftChild = await buildTreeStructure(leftChild, maxLevels);
    }
  }
  
  if (rootNode.rightChildId) {
    const rightChild = await TreeNode.findById(rootNode.rightChildId)
      .populate('userId', 'username firstName lastName wallets team');
    if (rightChild) {
      structure.rightChild = await buildTreeStructure(rightChild, maxLevels);
    }
  }
  
  return structure;
}

async function expandTreeFromNode(parentNode, levels) {
  const children = [];
  
  if (parentNode.leftChildId) {
    const leftChild = await TreeNode.findById(parentNode.leftChildId)
      .populate('userId', 'username firstName lastName wallets team');
    if (leftChild) {
      const leftStructure = await buildTreeStructure(leftChild, parentNode.treeNodeLevel + levels);
      children.push(leftStructure);
    }
  }
  
  if (parentNode.rightChildId) {
    const rightChild = await TreeNode.findById(parentNode.rightChildId)
      .populate('userId', 'username firstName lastName wallets team');
    if (rightChild) {
      const rightStructure = await buildTreeStructure(rightChild, parentNode.treeNodeLevel + levels);
      children.push(rightStructure);
    }
  }
  
  return children;
}

function calculateRankProgress(currentRank, thirtyDayVolume, personalStake) {
  const rankRequirements = {
    'Bronze': { volume: 5000, stake: 500, next: 'Silver' },
    'Silver': { volume: 50000, stake: 1000, next: 'Gold' },
    'Gold': { volume: 150000, stake: 2500, next: 'Diamond' },
    'Diamond': { volume: 500000, stake: 5000, next: 'Ruby' },
    'Ruby': { volume: 1000000, stake: 10000, next: null },
  };
  
  const current = rankRequirements[currentRank];
  if (!current || !current.next) {
    return {
      currentRank,
      nextRank: null,
      volumeRequired: 0,
      volumeCurrent: thirtyDayVolume,
      stakeRequired: 0,
      stakeCurrent: personalStake,
      progress: 100,
    };
  }
  
  const next = rankRequirements[current.next];
  const volumeProgress = (thirtyDayVolume / next.volume) * 100;
  const stakeProgress = (personalStake / next.stake) * 100;
  const overallProgress = Math.min((volumeProgress + stakeProgress) / 2, 100);
  
  return {
    currentRank,
    nextRank: current.next,
    volumeRequired: next.volume,
    volumeCurrent: thirtyDayVolume,
    stakeRequired: next.stake,
    stakeCurrent: personalStake,
    progress: overallProgress,
  };
}

async function calculateMaxTreeDepth(userId) {
  const userNode = await TreeNode.findOne({ userId });
  if (!userNode) return 0;
  
  const deepestNode = await TreeNode.findOne({
    treePosition: { $regex: `^${userNode.treePosition}` }
  }).sort({ treeNodeLevel: -1 });
  
  return deepestNode ? deepestNode.treeNodeLevel - userNode.treeNodeLevel : 0;
}

function sortTeamMembers(members, sortBy) {
  switch (sortBy) {
    case 'volume':
      return members.sort((a, b) => b.personalVolume - a.personalVolume);
    case 'team':
      return members.sort((a, b) => b.teamSize - a.teamSize);
    case 'earnings':
      return members.sort((a, b) => b.dailyROI - a.dailyROI);
    case 'referralLevel':
      return members.sort((a, b) => a.referralLevel - b.referralLevel);
    case 'date':
    default:
      return members.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  }
}

async function calculateVolumeGrowth(userId, days) {
  // Implementation would track volume changes over time
  return {
    currentVolume: 0,
    previousVolume: 0,
    growth: 0,
    percentage: 0,
  };
}

async function getTopPerformers(userId, limit) {
  const members = await getTeamMembersWithLevels(userId);
  return members
    .sort((a, b) => b.personalVolume - a.personalVolume)
    .slice(0, limit);
}

async function getLevelDistribution(userId) {
  const members = await getTeamMembersWithLevels(userId);
  const distribution = {};
  
  members.forEach(member => {
    const level = member.referralLevel;
    if (!distribution[level]) {
      distribution[level] = { count: 0, volume: 0 };
    }
    distribution[level].count++;
    distribution[level].volume += member.personalVolume;
  });
  
  return distribution;
}

async function projectEarnings(userId, days) {
  const matchingStats = await MatchingBonus.getBonusHistory(userId, days);
  const overrideStats = await LevelOverride.getOverrideHistory(userId, days);
  
  const dailyAvgMatching = matchingStats.reduce((sum, m) => sum + m.bonusAmount, 0) / days;
  const dailyAvgOverride = overrideStats.reduce((sum, o) => sum + o.overrideAmount, 0) / days;
  
  return {
    daily: dailyAvgMatching + dailyAvgOverride,
    weekly: (dailyAvgMatching + dailyAvgOverride) * 7,
    monthly: (dailyAvgMatching + dailyAvgOverride) * 30,
  };
}

module.exports = teamController; 