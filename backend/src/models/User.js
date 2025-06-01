const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Transaction Schema for wallet history
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'roi_credit', 'referral_bonus', 'matching_bonus', 'level_override', 'leadership_pool', 'milestone_reward'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  walletType: {
    type: String,
    enum: ['principal', 'income'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  txHash: {
    type: String, // For actual blockchain transactions later
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // For referral-related transactions
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  canDeposit: { type: Boolean, default: true },
  canWithdraw: { type: Boolean, default: true },
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  
  // Profile Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  
  // Wallet Information
  walletAddress: {
    type: String,
    sparse: true, // Allows multiple null values
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'],
  },

  // Dual Wallet System
  wallets: {
    principal: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      locked: {
        type: Boolean,
        default: true,
      },
      lockExpiry: {
        type: Date,
        default: null,
      },
      totalDeposited: {
        type: Number,
        default: 0,
      },
    },
    income: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
      totalWithdrawn: {
        type: Number,
        default: 0,
      },
      lastWithdrawalDate: {
        type: Date,
        default: null,
      },
      daysWithoutWithdrawal: {
        type: Number,
        default: 0,
      },
      compounding: {
        active: {
          type: Boolean,
          default: false,
        },
        startDate: {
          type: Date,
          default: null,
        },
        rate: {
          type: Number,
          default: 0.01, // 1.0% for Program I
        },
        totalCompounded: {
          type: Number,
          default: 0,
        },
        lastCompoundDate: {
          type: Date,
          default: null,
        },
      },
    },
  },

  // Transaction History
  transactions: [transactionSchema],
  
  // Investment Information
  investments: [{
    amount: {
      type: Number,
      required: true,
      min: [50, 'Minimum investment is $50'],
    },
    program: {
      type: String,
      enum: ['Program I', 'Program II', 'Program III', 'Program IV'],
      default: 'Program I',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    principalWallet: {
      balance: {
        type: Number,
        default: 0,
      },
      lockedUntil: {
        type: Date,
        default: function() {
          return new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months
        }
      },
    },
    incomeWallet: {
      balance: {
        type: Number,
        default: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
    },
    dailyROI: {
      type: Number,
      default: 0.75, // 0.75%
      min: 0.75,
      max: 1.15,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'withdrawn'],
      default: 'active',
    },
    lastROIDate: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Referral System
  referral: {
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referrals: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      dateReferred: {
        type: Date,
        default: Date.now,
      },
      commission: {
        type: Number,
        default: 0,
      },
      totalCommissionEarned: {
        type: Number,
        default: 0,
      },
    }],
    totalReferralEarnings: {
      type: Number,
      default: 0,
    },
    directReferrals: {
      type: Number,
      default: 0,
    },
  },
  
  // Team Building & MLM
  team: {
    leftSide: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      volume: {
        type: Number,
        default: 0,
      },
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    }],
    rightSide: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      volume: {
        type: Number,
        default: 0,
      },
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    }],
    teamVolume: {
      left: {
        type: Number,
        default: 0,
      },
      right: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      thirtyDayLeft: {
        type: Number,
        default: 0,
      },
      thirtyDayRight: {
        type: Number,
        default: 0,
      },
      thirtyDayTotal: {
        type: Number,
        default: 0,
      },
    },
    rank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Ruby'],
      default: 'Bronze',
    },
    pairs: {
      type: Number,
      default: 0,
    },
    matchingBonus: {
      totalEarned: {
        type: Number,
        default: 0,
      },
      dailyLimit: {
        type: Number,
        default: 2100, // Program I Bronze default
      },
      todayEarned: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
  },

  // MLM Earnings
  mlmEarnings: {
    levelOverrides: {
      totalEarned: {
        type: Number,
        default: 0,
      },
      byLevel: [{
        level: Number,
        earned: Number,
        count: Number,
      }],
    },
    leadershipPools: {
      totalEarned: {
        type: Number,
        default: 0,
      },
      monthlyEarnings: [{
        month: String, // YYYY-MM format
        rank: String,
        amount: Number,
        poolPercentage: Number,
      }],
    },
    milestoneRewards: {
      achieved: [{
        milestone: String,
        pairs: Number,
        reward: String,
        dateAchieved: Date,
        claimed: Boolean,
      }],
      totalValue: {
        type: Number,
        default: 0,
      },
    },
  },

  // Program-Specific Data
  programData: {
    currentProgram: {
      type: String,
      enum: ['Program I', 'Program II', 'Program III', 'Program IV'],
      default: 'Program I',
    },
    enhancedROI: {
      qualified: {
        type: Boolean,
        default: false,
      },
      rate: {
        type: Number,
        default: 0.75,
      },
      qualificationDate: Date,
    },
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: true, // No email verification required
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastROIProcessed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for total investment
userSchema.virtual('totalInvestment').get(function() {
  return this.investments.reduce((total, investment) => total + investment.amount, 0);
});

// Virtual for total balance (principal + income)
userSchema.virtual('totalBalance').get(function() {
  return this.wallets.principal.balance + this.wallets.income.balance;
});

// Virtual for daily earnings calculation
userSchema.virtual('dailyEarnings').get(function() {
  const activePrincipal = this.wallets.principal.balance;
  const currentROI = this.programData.enhancedROI.qualified ? 
    this.programData.enhancedROI.rate : 0.75;
  return activePrincipal * (currentROI / 100);
});

// Virtual for available balance (what can be withdrawn)
userSchema.virtual('availableBalance').get(function() {
  return this.wallets.income.balance;
});

// Virtual for locked balance
userSchema.virtual('lockedBalance').get(function() {
  return this.wallets.principal.locked ? this.wallets.principal.balance : 0;
});

// Generate unique referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.referral.referralCode) {
    let referralCode;
    let codeExists = true;
    
    while (codeExists) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await this.constructor.findOne({ 'referral.referralCode': referralCode });
      codeExists = !!existingUser;
    }
    
    this.referral.referralCode = referralCode;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to set password
userSchema.methods.setPassword = async function(newPassword) {
  this.password = newPassword; // Let pre('save') hook hash it
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Method to add transaction
userSchema.methods.addTransaction = function(transactionData) {
  this.transactions.push({
    ...transactionData,
    date: new Date(),
  });
  return this.save();
};

// Method to process dummy deposit
userSchema.methods.processDummyDeposit = function(amount, description = 'Test deposit') {
  // Add to principal wallet
  this.wallets.principal.balance += amount;
  this.wallets.principal.totalDeposited += amount;
  
  // Set lock expiry if this is first deposit
  if (!this.wallets.principal.lockExpiry) {
    this.wallets.principal.lockExpiry = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months
  }
  
  // Add transaction record
  this.transactions.push({
    type: 'deposit',
    amount: amount,
    walletType: 'principal',
    description: description,
    status: 'completed',
    date: new Date(),
  });
  
  return this.save();
};

// Method to process withdrawal
userSchema.methods.processWithdrawal = function(amount, description = 'Income withdrawal') {
  if (this.wallets.income.balance < amount) {
    throw new Error('Insufficient income balance');
  }
  
  // Platform fee 5%
  const fee = amount * 0.05;
  const netAmount = amount - fee;
  
  // Deduct from income wallet
  this.wallets.income.balance -= amount;
  this.wallets.income.totalWithdrawn += amount;
  
  // Add transaction record
  this.transactions.push({
    type: 'withdrawal',
    amount: netAmount,
    walletType: 'income',
    description: `${description} (Net: $${netAmount.toFixed(2)}, Fee: $${fee.toFixed(2)})`,
    status: 'completed',
    date: new Date(),
  });
  
  return this.save();
};

// Method to unlock principal wallet
userSchema.methods.unlockPrincipalWallet = function() {
  if (this.wallets.principal.lockExpiry && new Date() >= this.wallets.principal.lockExpiry) {
    this.wallets.principal.locked = false;
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;