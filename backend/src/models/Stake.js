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
  // Track if this specific stake qualifies for enhanced ROI
  isEnhancedROI: {
    type: Boolean,
    default: false,
  },
  actualROIRate: {
    type: Number,
    required: true,
    default: 0.0075, // The actual rate this stake earns (0.75% or 0.85%)
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
  
  // Use the actual ROI rate assigned to this specific stake
  const rate = this.actualROIRate;
  
  // If compounding is active, use compounding rate instead
  const finalRate = this.compounding.active ? this.compounding.rate : rate;
  
  return this.amount * finalRate;
};

// Check if user qualifies for enhanced ROI (for new stakes only)
stakeSchema.statics.checkUserEnhancedROIQualification = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return false;
  
  // Program I Enhanced ROI requirements:
  // 1. User has ≥ 5,000 USDT total stakes
  // 2. User has ≥ 1 direct referral with ≥ 1,000 USDT stake
  
  // Get user's total stake amount
  const allStakes = await this.find({ 
    userId: userId, 
    isActive: true 
  });
  const totalStakeAmount = allStakes.reduce((sum, stake) => sum + stake.amount, 0);
  
  if (totalStakeAmount >= 5000) {
    // Get user's direct referrals
    const directReferrals = await User.find({ 'referral.referredBy': userId });
    
    if (directReferrals.length > 0) {
      // Check if any referral has ≥ 1,000 USDT stake
      const referralStakes = await this.find({
        userId: { $in: directReferrals.map(r => r._id) },
        isActive: true,
      });
      
      // Group by user and sum their stakes
      const referralStakesByUser = {};
      referralStakes.forEach(stake => {
        const userId = stake.userId.toString();
        referralStakesByUser[userId] = (referralStakesByUser[userId] || 0) + stake.amount;
      });
      
      // Check if any referral has total stake ≥ 1,000
      const hasQualifiedReferral = Object.values(referralStakesByUser).some(total => total >= 1000);
      
      return hasQualifiedReferral;
    }
  }
  
  return false;
};

// Update existing method to not change rates on existing stakes
stakeSchema.methods.checkEnhancedROIQualification = async function() {
  // This method now only updates the user's qualification status
  // It doesn't change the rate on existing stakes
  const qualified = await mongoose.model('Stake').checkUserEnhancedROIQualification(this.userId);
  
  if (qualified && !this.enhancedROI.qualified) {
    this.enhancedROI.qualified = true;
    this.enhancedROI.qualificationDate = new Date();
    
    // Update user's enhanced ROI status
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.userId, {
      'programData.enhancedROIQualified': true,
      'programData.enhancedROIQualificationDate': new Date()
    });
  }
  
  return qualified;
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