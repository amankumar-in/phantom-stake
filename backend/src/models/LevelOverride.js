const mongoose = require('mongoose');

const levelOverrideSchema = new mongoose.Schema({
  // Earner (the upline who receives the override)
  earnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Source of the override (downline member)
  sourceUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Level information
  referralLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 15,
    index: true,
  },
  
  // Override calculation
  overridePercentage: {
    type: Number,
    required: true,
    min: 0.25,
    max: 8,
  },
  
  // Activity that generated the override
  activityType: {
    type: String,
    enum: ['deposit', 'daily_roi', 'matching_bonus', 'referral_bonus'],
    required: true,
  },
  
  activityAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  overrideAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Program tracking
  program: {
    type: String,
    enum: ['Program I', 'Program II', 'Program III', 'Program IV'],
    default: 'Program I',
  },
  
  // Date tracking
  date: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Processing status
  processed: {
    type: Boolean,
    default: false,
  },
  
  processedAt: {
    type: Date,
  },
  
  // Transaction reference
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
}, {
  timestamps: true,
});

// Compound indexes
levelOverrideSchema.index({ earnerId: 1, date: -1 });
levelOverrideSchema.index({ sourceUserId: 1, earnerId: 1 });
levelOverrideSchema.index({ processed: 1, date: 1 });

// Static method to get override percentage by level
levelOverrideSchema.statics.getOverridePercentage = function(level, program = 'Program I') {
  const overrides = {
    'Program I': {
      1: 5,      // Direct referrals
      2: 2,      // Level 2
      3: 1,      // Level 3
      4: 1,      // Level 4
      5: 1,      // Level 5
      6: 0.5,    // Level 6
      7: 0.5,    // Level 7
      8: 0.5,    // Level 8
      9: 0.25,   // Level 9
      10: 0.25,  // Level 10
      11: 0.25,  // Level 11
      12: 0.25,  // Level 12
      13: 0.25,  // Level 13
      14: 0.25,  // Level 14
      15: 0.25,  // Level 15
    },
    'Program II': {
      1: 6,
      2: 3,
      3: 1.5,
      4: 1.5,
      5: 1.5,
      6: 1,
      7: 1,
      8: 1,
      9: 0.5,
      10: 0.5,
      11: 0.5,
      12: 0.5,
      13: 0.5,
      14: 0.5,
      15: 0.5,
    },
    'Program III': {
      1: 7,
      2: 4,
      3: 2,
      4: 2,
      5: 2,
      6: 1.5,
      7: 1.5,
      8: 1.5,
      9: 1,
      10: 1,
      11: 1,
      12: 1,
      13: 1,
      14: 1,
      15: 1,
    },
    'Program IV': {
      1: 8,
      2: 5,
      3: 3,
      4: 3,
      5: 3,
      6: 2,
      7: 2,
      8: 2,
      9: 1,
      10: 1,
      11: 1,
      12: 1,
      13: 1,
      14: 1,
      15: 1,
    },
  };
  
  return overrides[program]?.[level] || 0;
};

// Static method to check qualification for level
levelOverrideSchema.statics.checkLevelQualification = async function(userId, level, program = 'Program I') {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return false;
  
  // Level 1 is always qualified (direct referrals)
  if (level === 1) return true;
  
  // Level 2 requires at least 2 direct referrals
  if (level === 2) {
    return user.referral.directReferrals >= 2;
  }
  
  // Program-specific qualifications
  const qualifications = {
    'Program I': {
      '3-5': { minStake: 1000 },
      '6-8': { minStake: 2000 },
      '9-15': { minStake: 5000 },
    },
    'Program II': {
      '3-5': { minStake: 1000 },
      '6-8': { minStake: 2000 },
      '9-15': { minStake: 5000 },
    },
    'Program III': {
      '3-5': { minStake: 2000, minReferrals: 3 },
      '6-8': { minStake: 4000, minReferrals: 3 },
      '9-15': { minStake: 10000, minReferrals: 3 },
    },
    'Program IV': {
      '3-5': { minStake: 3000, minReferrals: 5 },
      '6-8': { minStake: 5000, minReferrals: 5 },
      '9-15': { minStake: 15000, minReferrals: 5 },
    },
  };
  
  // Check which range the level falls into
  let requirement;
  if (level >= 3 && level <= 5) {
    requirement = qualifications[program]['3-5'];
  } else if (level >= 6 && level <= 8) {
    requirement = qualifications[program]['6-8'];
  } else if (level >= 9 && level <= 15) {
    requirement = qualifications[program]['9-15'];
  }
  
  if (!requirement) return false;
  
  // Check stake requirement
  const hasMinStake = user.wallets.principal.balance >= requirement.minStake;
  
  // Check referral requirement if exists
  const hasMinReferrals = !requirement.minReferrals || 
    user.referral.directReferrals >= requirement.minReferrals;
  
  return hasMinStake && hasMinReferrals;
};

// Instance method to calculate override
levelOverrideSchema.methods.calculateOverride = function() {
  this.overrideAmount = this.activityAmount * (this.overridePercentage / 100);
  return this.overrideAmount;
};

// Static method to get today's overrides for a user
levelOverrideSchema.statics.getTodayOverrides = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.find({
    earnerId: userId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).populate('sourceUserId', 'username firstName lastName');
};

// Static method to get override history
levelOverrideSchema.statics.getOverrideHistory = async function(userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  return await this.find({
    earnerId: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
  .populate('sourceUserId', 'username firstName lastName')
  .sort({ date: -1 });
};

// Static method to get total stats by level
levelOverrideSchema.statics.getStatsByLevel = async function(userId) {
  const result = await this.aggregate([
    { $match: { earnerId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$referralLevel',
        totalAmount: { $sum: '$overrideAmount' },
        count: { $sum: 1 },
        uniqueMembers: { $addToSet: '$sourceUserId' },
      },
    },
    {
      $project: {
        level: '$_id',
        totalAmount: 1,
        count: 1,
        uniqueMembers: { $size: '$uniqueMembers' },
      },
    },
    { $sort: { level: 1 } },
  ]);
  
  return result;
};

// Static method to get total override earnings
levelOverrideSchema.statics.getTotalEarnings = async function(userId) {
  const result = await this.aggregate([
    { $match: { earnerId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$overrideAmount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result[0] || { totalAmount: 0, count: 0 };
};

module.exports = mongoose.model('LevelOverride', levelOverrideSchema); 