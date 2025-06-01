const mongoose = require('mongoose');

const roiPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stakeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stake',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  roiRate: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['base_roi', 'enhanced_roi', 'compounding'],
    required: true,
  },
  program: {
    type: String,
    required: true,
    enum: ['I', 'II', 'III', 'IV'],
    default: 'I',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  compoundingDay: {
    type: Number,
    default: 0, // 0 for non-compounding, 1+ for compounding day number
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
roiPaymentSchema.index({ userId: 1, paymentDate: -1 });
roiPaymentSchema.index({ stakeId: 1, paymentDate: -1 });
roiPaymentSchema.index({ program: 1, paymentDate: -1 });
roiPaymentSchema.index({ paymentType: 1 });

// Static method to get user's ROI history
roiPaymentSchema.statics.getUserROIHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .populate('stakeId', 'amount program')
    .sort({ paymentDate: -1 })
    .limit(limit);
};

// Static method to get total ROI earnings for a user
roiPaymentSchema.statics.getUserTotalROI = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount' },
        paymentCount: { $sum: 1 },
        avgDailyROI: { $avg: '$amount' },
      }
    }
  ]);
};

// Static method to get ROI statistics by payment type
roiPaymentSchema.statics.getROIStatsByType = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$paymentType',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        lastPayment: { $max: '$paymentDate' },
      }
    }
  ]);
};

roiPaymentSchema.statics.getTotalPaidByUser = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
};

roiPaymentSchema.statics.getTodayPayments = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
};

module.exports = mongoose.model('ROIPayment', roiPaymentSchema);