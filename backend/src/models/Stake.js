const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 500, // Minimum stake amount in USDT
  },
  roiRate: {
    type: Number,
    required: true,
    default: 0.0075, // 0.75% daily base rate for Program I
  },
  program: {
    type: String,
    required: true,
    enum: ['I', 'II', 'III', 'IV'],
    default: 'I',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  totalROIEarned: {
    type: Number,
    default: 0,
  },
  lastROIDate: {
    type: Date,
    default: null,
  },
  enhancedROI: {
    qualified: {
      type: Boolean,
      default: false,
    },
    rate: {
      type: Number,
      default: 0.0085, // 0.85% enhanced rate for Program I
    },
    qualificationDate: {
      type: Date,
      default: null,
    },
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
      default: 0.01, // 1.0% compounding rate for Program I
    },
    daysWithoutWithdrawal: {
      type: Number,
      default: 0,
    },
  },
  transactions: [{
    type: {
      type: String,
      enum: ['roi_payment', 'compound_payment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    roiRate: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
stakeSchema.index({ userId: 1, isActive: 1 });
stakeSchema.index({ program: 1, isActive: 1 });
stakeSchema.index({ lastROIDate: 1 });

// Calculate daily ROI for this stake
stakeSchema.methods.calculateDailyROI = function() {
  if (!this.isActive) return 0;
  
  // Use enhanced ROI if qualified, otherwise base ROI
  const rate = this.enhancedROI.qualified ? this.enhancedROI.rate : this.roiRate;
  
  // If compounding is active, use compounding rate
  const finalRate = this.compounding.active ? this.compounding.rate : rate;
  
  return this.amount * finalRate;
};

// Check if stake qualifies for enhanced ROI
stakeSchema.methods.checkEnhancedROIQualification = async function() {
  const User = mongoose.model('User');
  const user = await User.findById(this.userId).populate('referrals');
  
  // Program I Enhanced ROI requirements:
  // 1. User has ≥ 5,000 USDT total stakes
  // 2. User has ≥ 1 direct referral with ≥ 1,000 USDT stake
  
  // Get user's total stake amount
  const allStakes = await mongoose.model('Stake').find({ 
    userId: this.userId, 
    isActive: true 
  });
  const totalStakeAmount = allStakes.reduce((sum, stake) => sum + stake.amount, 0);
  
  if (totalStakeAmount >= 5000) {
    // Check for qualified referrals
    const qualifiedReferrals = await mongoose.model('Stake').find({
      userId: { $in: user.referrals.map(r => r._id) },
      amount: { $gte: 1000 },
      isActive: true,
    });
    
    if (qualifiedReferrals.length >= 1) {
      this.enhancedROI.qualified = true;
      this.enhancedROI.qualificationDate = new Date();
      return true;
    }
  }
  
  return false;
};

// Process daily ROI payment
stakeSchema.methods.processROIPayment = async function() {
  if (!this.isActive) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if ROI already paid today
  if (this.lastROIDate && this.lastROIDate >= today) {
    return 0;
  }
  
  const roiAmount = this.calculateDailyROI();
  
  // Add transaction record
  this.transactions.push({
    type: 'roi_payment',
    amount: roiAmount,
    date: new Date(),
    roiRate: this.compounding.active ? this.compounding.rate : 
            (this.enhancedROI.qualified ? this.enhancedROI.rate : this.roiRate),
  });
  
  this.totalROIEarned += roiAmount;
  this.lastROIDate = new Date();
  
  // Update user's income wallet
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.userId, {
    $inc: { 'wallets.income.balance': roiAmount, 'wallets.income.totalEarned': roiAmount }
  });
  
  await this.save();
  return roiAmount;
};

module.exports = mongoose.model('Stake', stakeSchema);