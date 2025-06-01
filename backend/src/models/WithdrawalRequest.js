const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1000, // Minimum withdrawal amount
  },
  fees: {
    platform: {
      type: Number,
      required: true,
      default: 0,
    },
    gas: {
      type: Number,
      required: true,
      default: 5, // Default 5 USDT gas fee
    },
    total: {
      type: Number,
      required: true,
    },
  },
  netAmount: {
    type: Number,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'],
  },
  network: {
    type: String,
    enum: ['ETH', 'BSC', 'POLYGON', 'TRON'],
    default: 'ETH',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who processed the request
  },
  rejectionReason: {
    type: String,
  },
  transactionHash: {
    type: String, // Blockchain transaction hash when completed
  },
  notes: {
    type: String,
  },
  // Track balance changes for reversal if needed
  balanceSnapshot: {
    beforeWithdrawal: {
      type: Number,
      required: true,
    },
    afterWithdrawal: {
      type: Number,
      required: true,
    },
  },
  // Security tracking
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
withdrawalRequestSchema.index({ userId: 1, status: 1 });
withdrawalRequestSchema.index({ status: 1, requestedAt: -1 });
withdrawalRequestSchema.index({ processedBy: 1, processedAt: -1 });

// Calculate fees
withdrawalRequestSchema.statics.calculateFees = function(amount) {
  const platformFeeRate = 0.05; // 5%
  const minGasFee = 5; // 5 USDT minimum
  
  const platformFee = amount * platformFeeRate;
  const gasFee = minGasFee;
  const totalFees = platformFee + gasFee;
  const netAmount = amount - totalFees;
  
  return {
    platform: platformFee,
    gas: gasFee,
    total: totalFees,
    netAmount: netAmount,
  };
};

// Approve withdrawal
withdrawalRequestSchema.methods.approve = async function(adminId, transactionHash) {
  if (this.status !== 'pending') {
    throw new Error('Only pending withdrawals can be approved');
  }
  
  this.status = 'approved';
  this.processedAt = new Date();
  this.processedBy = adminId;
  
  if (transactionHash) {
    this.transactionHash = transactionHash;
    this.status = 'completed';
  }
  
  await this.save();
  
  // Create transaction record
  const Transaction = require('./Transaction');
  await Transaction.create({
    userId: this.userId,
    type: 'withdrawal',
    category: 'income',
    amount: -this.amount, // Negative for withdrawal
    description: `Withdrawal of ${this.amount} USDT (Net: ${this.netAmount} USDT)`,
    relatedId: this._id,
    status: 'completed',
  });
  
  return this;
};

// Reject withdrawal and refund
withdrawalRequestSchema.methods.reject = async function(adminId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending withdrawals can be rejected');
  }
  
  const User = require('./User');
  const user = await User.findById(this.userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Refund the amount back to income wallet
  user.wallets.income.balance += this.amount;
  await user.save();
  
  // Update withdrawal request
  this.status = 'rejected';
  this.processedAt = new Date();
  this.processedBy = adminId;
  this.rejectionReason = reason;
  
  await this.save();
  
  // Create refund transaction record
  const Transaction = require('./Transaction');
  await Transaction.create({
    userId: this.userId,
    type: 'withdrawal_refund',
    category: 'income',
    amount: this.amount,
    description: `Withdrawal request rejected: ${reason}`,
    relatedId: this._id,
    status: 'completed',
  });
  
  return this;
};

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema); 