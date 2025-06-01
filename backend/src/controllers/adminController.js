const WithdrawalRequest = require('../models/WithdrawalRequest');
const User = require('../models/User');

const adminController = {
  // Get all withdrawal requests (admin only)
  getAllWithdrawals: async (req, res) => {
    try {
      const { status, limit = 20, page = 1 } = req.query;
      
      const query = {};
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const withdrawals = await WithdrawalRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('userId', 'username firstName lastName email')
        .populate('processedBy', 'username firstName lastName');
      
      const total = await WithdrawalRequest.countDocuments(query);
      
      // Get summary statistics
      const stats = await WithdrawalRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);
      
      res.json({
        status: 'success',
        data: {
          withdrawals,
          stats,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting withdrawals:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get withdrawals',
      });
    }
  },

  // Approve withdrawal request
  approveWithdrawal: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { transactionHash, notes } = req.body;
      
      const withdrawal = await WithdrawalRequest.findById(requestId);
      
      if (!withdrawal) {
        return res.status(404).json({
          status: 'error',
          message: 'Withdrawal request not found',
        });
      }
      
      if (withdrawal.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Only pending withdrawals can be approved',
        });
      }
      
      // Update withdrawal request
      await withdrawal.approve(req.user._id, transactionHash);
      
      if (notes) {
        withdrawal.notes = notes;
        await withdrawal.save();
      }
      
      res.json({
        status: 'success',
        message: 'Withdrawal approved successfully',
        data: withdrawal,
      });
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to approve withdrawal',
      });
    }
  },

  // Reject withdrawal request
  rejectWithdrawal: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { reason, notes } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          status: 'error',
          message: 'Rejection reason is required',
        });
      }
      
      const withdrawal = await WithdrawalRequest.findById(requestId);
      
      if (!withdrawal) {
        return res.status(404).json({
          status: 'error',
          message: 'Withdrawal request not found',
        });
      }
      
      if (withdrawal.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Only pending withdrawals can be rejected',
        });
      }
      
      // Reject and refund
      await withdrawal.reject(req.user._id, reason);
      
      if (notes) {
        withdrawal.notes = notes;
        await withdrawal.save();
      }
      
      res.json({
        status: 'success',
        message: 'Withdrawal rejected and refunded successfully',
        data: withdrawal,
      });
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to reject withdrawal',
      });
    }
  },

  // Update withdrawal status (for processing state)
  updateWithdrawalStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, transactionHash, notes } = req.body;
      
      const validStatuses = ['processing', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be: processing, completed, or failed',
        });
      }
      
      const withdrawal = await WithdrawalRequest.findById(requestId);
      
      if (!withdrawal) {
        return res.status(404).json({
          status: 'error',
          message: 'Withdrawal request not found',
        });
      }
      
      if (withdrawal.status !== 'approved' && status === 'processing') {
        return res.status(400).json({
          status: 'error',
          message: 'Only approved withdrawals can be marked as processing',
        });
      }
      
      withdrawal.status = status;
      if (transactionHash) {
        withdrawal.transactionHash = transactionHash;
      }
      if (notes) {
        withdrawal.notes = notes;
      }
      
      await withdrawal.save();
      
      res.json({
        status: 'success',
        message: `Withdrawal status updated to ${status}`,
        data: withdrawal,
      });
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update withdrawal status',
      });
    }
  },

  // Get withdrawal statistics
  getWithdrawalStats: async (req, res) => {
    try {
      const stats = await WithdrawalRequest.aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFees: { $sum: '$fees.total' },
            totalNet: { $sum: '$netAmount' },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
            },
          },
        },
      ]);
      
      res.json({
        status: 'success',
        data: stats[0] || {
          totalRequests: 0,
          totalAmount: 0,
          totalFees: 0,
          totalNet: 0,
          pending: 0,
          pendingAmount: 0,
          approved: 0,
          completed: 0,
          rejected: 0,
        },
      });
    } catch (error) {
      console.error('Error getting withdrawal stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get withdrawal statistics',
      });
    }
  },

  // User management
  listUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-passwordHash').lean();
      res.json({ status: 'success', data: users });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  addUser: async (req, res) => {
    try {
      const { username, email, password, isAdmin } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }
      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'User already exists' });
      }
      const user = new User({ username, email, isAdmin: !!isAdmin, canDeposit: true, canWithdraw: true });
      await user.setPassword(password);
      await user.save();
      res.json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  editUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { username, email, isAdmin } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      if (username) user.username = username;
      if (email) user.email = email;
      if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
      await user.save();
      res.json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.json({ status: 'success', message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) return res.status(400).json({ status: 'error', message: 'Missing new password' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      console.log('RESET PASSWORD (plain):', newPassword);
      await user.setPassword(newPassword);
      console.log('RESET PASSWORD (hash):', user.password);
      // Force markModified in case Mongoose doesn't detect change
      user.markModified('password');
      await user.save();
      // Double-check: reload and log hash
      const checkUser = await User.findById(userId);
      console.log('Password after reset:', checkUser.password);
      res.json({ status: 'success', message: 'Password reset' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  setAdmin: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.isAdmin = true;
      await user.save();
      res.json({ status: 'success', message: 'User set as admin' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  unsetAdmin: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.isAdmin = false;
      await user.save();
      res.json({ status: 'success', message: 'User admin removed' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  blockUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.isBlocked = true;
      await user.save();
      res.json({ status: 'success', message: 'User blocked' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  unblockUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.isBlocked = false;
      await user.save();
      res.json({ status: 'success', message: 'User unblocked' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  enableDeposit: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.canDeposit = true;
      await user.save();
      res.json({ status: 'success', message: 'Deposit enabled' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  disableDeposit: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.canDeposit = false;
      await user.save();
      res.json({ status: 'success', message: 'Deposit disabled' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  enableWithdrawal: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.canWithdraw = true;
      await user.save();
      res.json({ status: 'success', message: 'Withdrawal enabled' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  disableWithdrawal: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      user.canWithdraw = false;
      await user.save();
      res.json({ status: 'success', message: 'Withdrawal disabled' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  getUserInvestments: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      // Assuming investments are stored in user.investments
      res.json({ status: 'success', data: user.investments || [] });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  getUserEarnings: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      // Assuming earnings are stored in user.earnings
      res.json({ status: 'success', data: user.earnings || 0 });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
};

module.exports = adminController; 