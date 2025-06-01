const mongoose = require('mongoose');

const matchingBonusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Volume data
  leftLegVolume: {
    type: Number,
    required: true,
    min: 0,
  },
  
  rightLegVolume: {
    type: Number,
    required: true,
    min: 0,
  },
  
  matchedVolume: {
    type: Number,
    required: true,
    min: 0,
  },
  
  spilloverLeft: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  spilloverRight: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Bonus calculation
  userRank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Ruby'],
    required: true,
  },
  
  matchingRate: {
    type: Number,
    required: true, // 8-16% based on rank
    min: 8,
    max: 16,
  },
  
  bonusAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  dailyCap: {
    type: Number,
    required: true, // Daily cap based on rank
  },
  
  dailyCapUsed: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Pairs tracking
  pairsFormed: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Date tracking
  date: {
    type: Date,
    required: true,
    index: true,
  },
  
  program: {
    type: String,
    enum: ['Program I', 'Program II', 'Program III', 'Program IV'],
    default: 'Program I',
  },
  
  // Processing status
  processed: {
    type: Boolean,
    default: false,
  },
  
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound index for user and date
matchingBonusSchema.index({ userId: 1, date: -1 });
matchingBonusSchema.index({ processed: 1, date: 1 });

// Static method to get matching rate by rank
matchingBonusSchema.statics.getMatchingRateByRank = function(rank, program = 'Program I') {
  const rates = {
    'Program I': {
      'Bronze': 8,
      'Silver': 9,
      'Gold': 10,
      'Diamond': 11,
      'Ruby': 12,
    },
    'Program II': {
      'Bronze': 9,
      'Silver': 10,
      'Gold': 11,
      'Diamond': 12,
      'Ruby': 13,
    },
    'Program III': {
      'Bronze': 10,
      'Silver': 11,
      'Gold': 12,
      'Diamond': 13,
      'Ruby': 14,
    },
    'Program IV': {
      'Bronze': 12,
      'Silver': 13,
      'Gold': 14,
      'Diamond': 15,
      'Ruby': 16,
    },
  };
  
  return rates[program][rank] || rates['Program I']['Bronze'];
};

// Static method to get daily cap by rank
matchingBonusSchema.statics.getDailyCapByRank = function(rank, program = 'Program I') {
  const caps = {
    'Program I': {
      'Bronze': 2100,
      'Silver': 2500,
      'Gold': 3000,
      'Diamond': 4000,
      'Ruby': 5000,
    },
    'Program II': {
      'Bronze': 3000,
      'Silver': 4000,
      'Gold': 5000,
      'Diamond': 6000,
      'Ruby': 7000,
    },
    'Program III': {
      'Bronze': 5000,
      'Silver': 6000,
      'Gold': 7000,
      'Diamond': 8000,
      'Ruby': 9000,
    },
    'Program IV': {
      'Bronze': 5000,
      'Silver': 6000,
      'Gold': 8000,
      'Diamond': 10000,
      'Ruby': 12000,
    },
  };
  
  return caps[program][rank] || caps['Program I']['Bronze'];
};

// Instance method to calculate bonus
matchingBonusSchema.methods.calculateBonus = function() {
  // Calculate matched volume
  this.matchedVolume = Math.min(this.leftLegVolume, this.rightLegVolume);
  
  // Calculate spillover
  this.spilloverLeft = Math.max(0, this.leftLegVolume - this.matchedVolume);
  this.spilloverRight = Math.max(0, this.rightLegVolume - this.matchedVolume);
  
  // Calculate bonus amount
  const potentialBonus = this.matchedVolume * (this.matchingRate / 100);
  
  // Apply daily cap
  const remainingCap = this.dailyCap - this.dailyCapUsed;
  this.bonusAmount = Math.min(potentialBonus, remainingCap);
  
  // Calculate pairs (assuming 1 pair = 1 USDT matched)
  this.pairsFormed = Math.floor(this.matchedVolume);
  
  return this.bonusAmount;
};

// Static method to get today's bonus for a user
matchingBonusSchema.statics.getTodayBonus = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.findOne({
    userId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};

// Static method to get bonus history
matchingBonusSchema.statics.getBonusHistory = async function(userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  return await this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Static method to get total stats
matchingBonusSchema.statics.getTotalStats = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalBonus: { $sum: '$bonusAmount' },
        totalPairs: { $sum: '$pairsFormed' },
        totalMatched: { $sum: '$matchedVolume' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result[0] || {
    totalBonus: 0,
    totalPairs: 0,
    totalMatched: 0,
    count: 0,
  };
};

module.exports = mongoose.model('MatchingBonus', matchingBonusSchema); 