const User = require('../models/User');
const TreeNode = require('../models/TreeNode');
const MatchingBonus = require('../models/MatchingBonus');
const LevelOverride = require('../models/LevelOverride');
const mongoose = require('mongoose');

const mlmService = {
  // Auto-place new member in binary tree
  autoPlaceNewMember: async function(newUserId, sponsorId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get sponsor's tree node
      const sponsorNode = await TreeNode.findOne({ userId: sponsorId }).session(session);
      if (!sponsorNode) {
        throw new Error('Sponsor not found in binary tree');
      }
      
      // Calculate referral level
      const referralLevel = await this.calculateReferralLevel(sponsorId, newUserId);
      
      // Find best placement position
      const placement = await this.findBestPlacement(sponsorNode, session);
      
      // Create new tree node
      const newNode = new TreeNode({
        userId: newUserId,
        parentId: placement.parentId,
        sponsorId: sponsorId,
        position: placement.position,
        treePosition: placement.treePosition,
        treeNodeLevel: placement.level,
        referralLevel: referralLevel,
        personalVolume: 0,
        leftLegVolume: 0,
        rightLegVolume: 0,
        isActive: true,
      });
      
      await newNode.save({ session });
      
      // Update parent's child reference
      const parentNode = await TreeNode.findById(placement.parentId).session(session);
      if (placement.position === 'left') {
        parentNode.leftChildId = newNode._id;
      } else {
        parentNode.rightChildId = newNode._id;
      }
      await parentNode.save({ session });
      
      // Update all ancestors' volumes
      await this.updateAncestorVolumes(placement.parentId, session);
      
      // Create initial referral bonus for sponsor
      await this.createReferralBonus(sponsorId, newUserId, session);
      
      await session.commitTransaction();
      
      return {
        success: true,
        placement: {
          nodeId: newNode._id,
          position: placement.position,
          treePosition: placement.treePosition,
          parentId: placement.parentId,
          level: placement.level,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Find best placement position using binary tree rules
  findBestPlacement: async function(sponsorNode, session) {
    // Calculate which leg has less volume for the sponsor
    const sponsorLeftVolume = sponsorNode.leftLegVolume;
    const sponsorRightVolume = sponsorNode.rightLegVolume;
    const preferredLeg = sponsorLeftVolume <= sponsorRightVolume ? 'left' : 'right';
    
    // Use breadth-first search starting from sponsor's preferred leg
    const queue = [sponsorNode];
    
    while (queue.length > 0) {
      const node = queue.shift();
      
      // Check preferred leg first
      if (preferredLeg === 'left' && !node.leftChildId) {
        return {
          parentId: node._id,
          position: 'left',
          treePosition: node.treePosition ? `${node.treePosition}-L` : 'L',
          level: node.treeNodeLevel + 1,
        };
      }
      
      if (preferredLeg === 'right' && !node.rightChildId) {
        return {
          parentId: node._id,
          position: 'right',
          treePosition: node.treePosition ? `${node.treePosition}-R` : 'R',
          level: node.treeNodeLevel + 1,
        };
      }
      
      // Check opposite leg
      if (!node.leftChildId) {
        return {
          parentId: node._id,
          position: 'left',
          treePosition: node.treePosition ? `${node.treePosition}-L` : 'L',
          level: node.treeNodeLevel + 1,
        };
      }
      
      if (!node.rightChildId) {
        return {
          parentId: node._id,
          position: 'right',
          treePosition: node.treePosition ? `${node.treePosition}-R` : 'R',
          level: node.treeNodeLevel + 1,
        };
      }
      
      // Add children to queue
      if (node.leftChildId) {
        const leftChild = await TreeNode.findById(node.leftChildId).session(session);
        if (leftChild) queue.push(leftChild);
      }
      
      if (node.rightChildId) {
        const rightChild = await TreeNode.findById(node.rightChildId).session(session);
        if (rightChild) queue.push(rightChild);
      }
    }
    
    throw new Error('No available position found in binary tree');
  },

  // Calculate referral level from sponsor
  calculateReferralLevel: async function(sponsorId, newUserId) {
    const sponsor = await User.findById(sponsorId);
    const sponsorNode = await TreeNode.findOne({ userId: sponsorId });
    
    if (!sponsorNode) {
      return 1; // Direct referral if sponsor has no tree node yet
    }
    
    // For the sponsor's direct referrals, the level is always 1
    // The referral level is based on sponsorship chain, not tree position
    return 1; // This will always be 1 for direct referrals
  },

  // Update all ancestor volumes up the tree
  updateAncestorVolumes: async function(nodeId, session) {
    if (!nodeId) return;
    
    const node = await TreeNode.findById(nodeId).session(session);
    if (!node) return;
    
    // Recalculate volumes from children
    let leftVolume = 0;
    let rightVolume = 0;
    let leftCount = 0;
    let rightCount = 0;
    
    if (node.leftChildId) {
      const leftChild = await TreeNode.findById(node.leftChildId).session(session);
      if (leftChild) {
        leftVolume = leftChild.personalVolume + leftChild.leftLegVolume + leftChild.rightLegVolume;
        leftCount = 1 + leftChild.totalTeamSize;
      }
    }
    
    if (node.rightChildId) {
      const rightChild = await TreeNode.findById(node.rightChildId).session(session);
      if (rightChild) {
        rightVolume = rightChild.personalVolume + rightChild.leftLegVolume + rightChild.rightLegVolume;
        rightCount = 1 + rightChild.totalTeamSize;
      }
    }
    
    node.leftLegVolume = leftVolume;
    node.rightLegVolume = rightVolume;
    node.leftLegCount = leftCount;
    node.rightLegCount = rightCount;
    node.totalTeamSize = leftCount + rightCount;
    node.lastVolumeUpdate = new Date();
    
    await node.save({ session });
    
    // Recursively update parent
    if (node.parentId) {
      await this.updateAncestorVolumes(node.parentId, session);
    }
  },

  // Calculate and process daily matching bonuses
  processDailyMatchingBonuses: async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all active users with tree nodes
    const activeNodes = await TreeNode.find({ isActive: true })
      .populate('userId', 'team programData');
    
    for (const node of activeNodes) {
      if (!node.userId) continue;
      
      // Check if already processed today
      const existingBonus = await MatchingBonus.findOne({
        userId: node.userId._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });
      
      if (existingBonus) continue;
      
      // Calculate matching bonus
      const userRank = node.userId.team?.rank || 'Bronze';
      const program = node.userId.programData?.currentProgram || 'Program I';
      const matchingRate = MatchingBonus.getMatchingRateByRank(userRank, program);
      const dailyCap = MatchingBonus.getDailyCapByRank(userRank, program);
      
      // Get today's used cap
      const todayUsed = await this.getTodayUsedCap(node.userId._id);
      
      // Create matching bonus record
      const matchingBonus = new MatchingBonus({
        userId: node.userId._id,
        leftLegVolume: node.leftLegVolume,
        rightLegVolume: node.rightLegVolume,
        matchedVolume: Math.min(node.leftLegVolume, node.rightLegVolume),
        spilloverLeft: node.spilloverLeft,
        spilloverRight: node.spilloverRight,
        userRank: userRank,
        matchingRate: matchingRate,
        dailyCap: dailyCap,
        dailyCapUsed: todayUsed,
        date: today,
        program: program,
      });
      
      // Calculate bonus amount
      const bonusAmount = matchingBonus.calculateBonus();
      
      if (bonusAmount > 0) {
        // Credit to user's income wallet
        await this.creditIncomeWallet(node.userId._id, bonusAmount, 'matching_bonus');
        
        matchingBonus.processed = true;
        matchingBonus.processedAt = new Date();
        await matchingBonus.save();
      }
    }
  },

  // Process level overrides for an activity
  processLevelOverrides: async function(sourceUserId, activityType, activityAmount) {
    const sourceUser = await User.findById(sourceUserId);
    if (!sourceUser || !sourceUser.referral.referredBy) return;
    
    const program = sourceUser.programData?.currentProgram || 'Program I';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Traverse up the sponsorship chain
    let currentSponsorId = sourceUser.referral.referredBy;
    let level = 1;
    
    while (currentSponsorId && level <= 15) {
      const sponsor = await User.findById(currentSponsorId);
      if (!sponsor) break;
      
      // Check if sponsor qualifies for this level
      const qualifies = await LevelOverride.checkLevelQualification(currentSponsorId, level, program);
      if (qualifies) {
        const overridePercentage = LevelOverride.getOverridePercentage(level, program);
        
        if (overridePercentage > 0) {
          // Create override record
          const override = new LevelOverride({
            earnerId: currentSponsorId,
            sourceUserId: sourceUserId,
            referralLevel: level,
            overridePercentage: overridePercentage,
            activityType: activityType,
            activityAmount: activityAmount,
            program: program,
            date: today,
          });
          
          const overrideAmount = override.calculateOverride();
          
          if (overrideAmount > 0) {
            // Credit to sponsor's income wallet
            await this.creditIncomeWallet(currentSponsorId, overrideAmount, 'level_override');
            
            override.processed = true;
            override.processedAt = new Date();
            await override.save();
          }
        }
      }
      
      // Move up the chain
      currentSponsorId = sponsor.referral.referredBy;
      level++;
    }
  },

  // Create referral bonus
  createReferralBonus: async function(sponsorId, newUserId, session) {
    const newUser = await User.findById(newUserId).session(session);
    const sponsor = await User.findById(sponsorId).session(session);
    
    if (!newUser || !sponsor) return;
    
    // Check if sponsor has minimum stake to qualify
    if (sponsor.wallets.principal.balance < 100) return;
    
    // Calculate 10% referral bonus on initial deposit
    const depositAmount = newUser.wallets.principal.balance;
    const bonusAmount = depositAmount * 0.1;
    
    if (bonusAmount > 0) {
      // Credit to sponsor's income wallet
      sponsor.wallets.income.balance += bonusAmount;
      sponsor.wallets.income.totalEarned += bonusAmount;
      sponsor.referral.totalReferralEarnings += bonusAmount;
      
      // Add transaction record
      sponsor.transactions.push({
        type: 'referral_bonus',
        amount: bonusAmount,
        walletType: 'income',
        description: `10% referral bonus from ${newUser.username}`,
        relatedUser: newUserId,
        status: 'completed',
      });
      
      await sponsor.save({ session });
    }
  },

  // Update personal volume when user makes deposit
  updatePersonalVolume: async function(userId, newDeposit) {
    const node = await TreeNode.findOne({ userId });
    if (!node) return;
    
    node.personalVolume += newDeposit;
    await node.save();
    
    // Update all ancestors
    await this.updateAncestorVolumes(node.parentId);
    
    // Process level overrides for this deposit
    await this.processLevelOverrides(userId, 'deposit', newDeposit);
  },

  // Get today's used matching cap
  getTodayUsedCap: async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBonuses = await MatchingBonus.find({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    return todayBonuses.reduce((sum, bonus) => sum + bonus.bonusAmount, 0);
  },

  // Credit income wallet
  creditIncomeWallet: async function(userId, amount, type) {
    const user = await User.findById(userId);
    if (!user) return;
    
    user.wallets.income.balance += amount;
    user.wallets.income.totalEarned += amount;
    
    // Add transaction record
    user.transactions.push({
      type: type,
      amount: amount,
      walletType: 'income',
      description: `${type.replace('_', ' ')} credit`,
      status: 'completed',
    });
    
    await user.save();
  },

  // Calculate rank based on volume and stake
  calculateUserRank: async function(userId) {
    const user = await User.findById(userId);
    const node = await TreeNode.findOne({ userId });
    
    if (!user || !node) return 'Bronze';
    
    const thirtyDayVolume = node.leftLegVolume + node.rightLegVolume;
    const personalStake = user.wallets.principal.balance;
    
    const ranks = [
      { name: 'Ruby', volume: 1000000, stake: 10000 },
      { name: 'Diamond', volume: 500000, stake: 5000 },
      { name: 'Gold', volume: 150000, stake: 2500 },
      { name: 'Silver', volume: 50000, stake: 1000 },
      { name: 'Bronze', volume: 5000, stake: 500 },
    ];
    
    for (const rank of ranks) {
      if (thirtyDayVolume >= rank.volume && personalStake >= rank.stake) {
        return rank.name;
      }
    }
    
    return 'Bronze';
  },

  // Update user ranks periodically
  updateAllUserRanks: async function() {
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      const newRank = await this.calculateUserRank(user._id);
      if (user.team.rank !== newRank) {
        user.team.rank = newRank;
        await user.save();
      }
    }
  },
};

module.exports = mlmService; 