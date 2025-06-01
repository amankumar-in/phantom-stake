const mongoose = require('mongoose');

const leadershipPoolSchema = new mongoose.Schema({
  program: {
    type: String,
    required: true,
    enum: ['I', 'II', 'III', 'IV'],
    default: 'I'
  },
  month: {
    type: Date,
    required: true,
    index: true
  },
  totalDeposits: {
    type: Number,
    required: true,
    default: 0
  },
  pools: {
    silver: {
      percentage: { type: Number, default: 0.005 }, // 0.5% for Program I
      totalAmount: { type: Number, default: 0 },
      qualifiedMembers: { type: Number, default: 0 },
      perMemberShare: { type: Number, default: 0 },
      distributed: { type: Boolean, default: false },
      distributionDate: { type: Date }
    },
    gold: {
      percentage: { type: Number, default: 0.01 }, // 1.0% for Program I
      totalAmount: { type: Number, default: 0 },
      qualifiedMembers: { type: Number, default: 0 },
      perMemberShare: { type: Number, default: 0 },
      distributed: { type: Boolean, default: false },
      distributionDate: { type: Date }
    },
    diamond: {
      percentage: { type: Number, default: 0.015 }, // 1.5% for Program I
      totalAmount: { type: Number, default: 0 },
      qualifiedMembers: { type: Number, default: 0 },
      perMemberShare: { type: Number, default: 0 },
      distributed: { type: Boolean, default: false },
      distributionDate: { type: Date }
    },
    ruby: {
      percentage: { type: Number, default: 0.02 }, // 2.0% for Program I
      totalAmount: { type: Number, default: 0 },
      qualifiedMembers: { type: Number, default: 0 },
      perMemberShare: { type: Number, default: 0 },
      distributed: { type: Boolean, default: false },
      distributionDate: { type: Date }
    }
  },
  status: {
    type: String,
    enum: ['collecting', 'ready', 'distributed'],
    default: 'collecting'
  }
}, {
  timestamps: true
});

// Index for efficient queries
leadershipPoolSchema.index({ program: 1, month: -1 });
leadershipPoolSchema.index({ status: 1, month: 1 });

// Static method to get or create current month's pool
leadershipPoolSchema.statics.getCurrentPool = async function(program = 'I') {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  let pool = await this.findOne({ 
    program, 
    month: monthStart 
  });
  
  if (!pool) {
    pool = await this.create({
      program,
      month: monthStart,
      totalDeposits: 0,
      status: 'collecting'
    });
  }
  
  return pool;
};

// Add deposit to current month's pool
leadershipPoolSchema.statics.addDeposit = async function(amount, program = 'I') {
  const pool = await this.getCurrentPool(program);
  
  pool.totalDeposits += amount;
  
  // Update pool amounts
  pool.pools.silver.totalAmount = pool.totalDeposits * pool.pools.silver.percentage;
  pool.pools.gold.totalAmount = pool.totalDeposits * pool.pools.gold.percentage;
  pool.pools.diamond.totalAmount = pool.totalDeposits * pool.pools.diamond.percentage;
  pool.pools.ruby.totalAmount = pool.totalDeposits * pool.pools.ruby.percentage;
  
  await pool.save();
  return pool;
};

// Calculate pool distribution
leadershipPoolSchema.methods.calculateDistribution = async function() {
  const User = mongoose.model('User');
  const TreeNode = mongoose.model('TreeNode');
  
  // Get qualified members for each rank
  const ranks = ['Silver', 'Gold', 'Diamond', 'Ruby'];
  
  for (const rank of ranks) {
    const rankLower = rank.toLowerCase();
    
    // Find all users with this rank who maintained it throughout the month
    const qualifiedUsers = await User.find({
      'team.rank': rank,
      isActive: true,
      createdAt: { $lt: this.month } // Must have joined before this month
    });
    
    // Verify they maintain minimum stake requirement
    const validUsers = [];
    const minStakeRequirements = {
      'Silver': 1000,
      'Gold': 2500,
      'Diamond': 5000,
      'Ruby': 10000
    };
    
    for (const user of qualifiedUsers) {
      if (user.wallets.principal.balance >= minStakeRequirements[rank]) {
        validUsers.push(user);
      }
    }
    
    this.pools[rankLower].qualifiedMembers = validUsers.length;
    
    if (validUsers.length > 0) {
      this.pools[rankLower].perMemberShare = 
        this.pools[rankLower].totalAmount / validUsers.length;
    }
  }
  
  this.status = 'ready';
  await this.save();
  
  return this;
};

// Distribute pool to qualified members
leadershipPoolSchema.methods.distribute = async function() {
  if (this.status !== 'ready') {
    throw new Error('Pool not ready for distribution');
  }
  
  const User = mongoose.model('User');
  const Transaction = mongoose.model('Transaction');
  const ranks = ['Silver', 'Gold', 'Diamond', 'Ruby'];
  
  for (const rank of ranks) {
    const rankLower = rank.toLowerCase();
    const pool = this.pools[rankLower];
    
    if (pool.qualifiedMembers > 0 && !pool.distributed) {
      // Find qualified users again
      const qualifiedUsers = await User.find({
        'team.rank': rank,
        isActive: true,
        createdAt: { $lt: this.month }
      });
      
      const minStake = {
        'Silver': 1000,
        'Gold': 2500,
        'Diamond': 5000,
        'Ruby': 10000
      }[rank];
      
      for (const user of qualifiedUsers) {
        if (user.wallets.principal.balance >= minStake) {
          // Credit pool share to income wallet
          user.wallets.income.balance += pool.perMemberShare;
          user.wallets.income.totalEarned += pool.perMemberShare;
          
          await user.save();
          
          // Create transaction record
          await Transaction.create({
            userId: user._id,
            type: 'leadership_pool',
            category: 'income',
            amount: pool.perMemberShare,
            description: `${rank} leadership pool distribution for ${this.month.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            relatedId: this._id,
            status: 'completed'
          });
        }
      }
      
      pool.distributed = true;
      pool.distributionDate = new Date();
    }
  }
  
  this.status = 'distributed';
  await this.save();
  
  return this;
};

module.exports = mongoose.model('LeadershipPool', leadershipPoolSchema); 