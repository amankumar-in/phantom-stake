const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'roi', 'referral', 'matching_bonus', 'level_override', 'milestone_reward', 'rank_bonus'],
    required: true,
  },
  category: {
    type: String,
    enum: ['income', 'principal', 'bonus'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USDT',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
  },
  walletType: {
    type: String,
    enum: ['principal', 'income'],
    required: true,
  },
  reference: {
    type: String,
    unique: true,
    sparse: true,
  },
  txHash: {
    type: String,
    sparse: true,
  },
  fromAddress: {
    type: String,
  },
  toAddress: {
    type: String,
  },
  fee: {
    platformFee: {
      type: Number,
      default: 0,
    },
    networkFee: {
      type: Number,
      default: 0,
    },
    totalFee: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  processedAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ txHash: 1 });

// Virtual for net amount (after fees)
transactionSchema.virtual('netAmount').get(function() {
  if (this.type === 'withdrawal') {
    return this.amount - (this.fee?.totalFee || 0);
  }
  return this.amount;
});

// Methods
transactionSchema.methods.markAsCompleted = async function(txHash) {
  this.status = 'completed';
  this.processedAt = new Date();
  if (txHash) {
    this.txHash = txHash;
  }
  return this.save();
};

transactionSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  this.processedAt = new Date();
  this.failureReason = reason;
  return this.save();
};

// Statics
transactionSchema.statics.getTransactionHistory = async function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100);
};

transactionSchema.statics.calculateTotalsByType = async function(userId, type, dateRange) {
  const match = { userId, type, status: 'completed' };
  
  if (dateRange) {
    match.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }
  
  const result = await this.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
  ]);
  
  return result[0] || { totalAmount: 0, count: 0 };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 