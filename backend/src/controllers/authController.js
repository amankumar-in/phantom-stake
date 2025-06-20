const User = require('../models/User');
const TreeNode = require('../models/TreeNode');
const mlmService = require('../services/mlmService');
const validator = require('validator');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        referralCode,
      } = req.body;

      // Validate required fields
      if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({
          status: 'error',
          message: 'All fields are required',
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a valid email address',
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: existingUser.email === email 
            ? 'Email is already registered' 
            : 'Username is already taken',
        });
      }

      // Handle referral
      let referredBy = null;
      if (referralCode) {
        referredBy = await User.findOne({ 'referral.referralCode': referralCode.toUpperCase() });
        if (!referredBy) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid referral code',
          });
        }
      }

      // Create new user
      const userData = {
        username,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
      };

      if (referredBy) {
        userData['referral.referredBy'] = referredBy._id;
      }

      const user = new User(userData);
      await user.save();

      // Add user to referrer's referrals list and update direct referral count
      if (referredBy) {
        referredBy.referral.referrals.push({
          user: user._id,
          dateReferred: new Date(),
          commission: 0,
        });
        referredBy.referral.directReferrals = referredBy.referral.referrals.length;
        await referredBy.save();
      }

      // Create binary tree node
      try {
        if (referredBy) {
          // Auto-place in binary tree under sponsor
          await mlmService.autoPlaceNewMember(user._id, referredBy._id);
        } else {
          // This is the first user or a user with no referrer - create root node
          const rootNode = new TreeNode({
            userId: user._id,
            parentId: null,
            sponsorId: user._id, // Self-sponsored if no referrer
            position: 'root',
            treePosition: '',
            treeNodeLevel: 0,
            referralLevel: 0,
            personalVolume: 0,
            leftLegVolume: 0,
            rightLegVolume: 0,
            isActive: true,
          });
          await rootNode.save();
        }
      } catch (treeError) {
        console.error('Binary tree creation error:', treeError);
        // Continue with registration even if tree creation fails
        // This can be fixed later by admin
      }

      // Generate JWT token
      const token = user.generateAuthToken();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        status: 'success',
        message: 'Account created successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            referralCode: user.referral.referralCode,
            totalInvestment: user.totalInvestment,
            totalBalance: user.totalBalance,
            dailyEarnings: user.dailyEarnings,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          status: 'error',
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`,
        });
      }

      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          status: 'error',
          message: errorMessages[0],
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Registration failed. Please try again.',
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { emailOrUsername, password } = req.body;
      console.log('LOGIN ATTEMPT:', { emailOrUsername, password });

      // Validate required fields
      if (!emailOrUsername || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email/Username and password are required',
        });
      }

      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername }
        ]
      });
      console.log('USER FOUND:', user ? user.username : null);

      if (!user) {
        console.log('LOGIN FAIL: User not found');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // Check if account is active
      if (!user.isActive) {
        console.log('LOGIN FAIL: User not active');
        return res.status(401).json({
          status: 'error',
          message: 'Account has been deactivated. Please contact support.',
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      console.log('PASSWORD VALID:', isPasswordValid);
      if (!isPasswordValid) {
        console.log('LOGIN FAIL: Password mismatch');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = user.generateAuthToken();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            referralCode: user.referral.referralCode,
            totalInvestment: user.totalInvestment,
            totalBalance: user.totalBalance,
            dailyEarnings: user.dailyEarnings,
            walletAddress: user.walletAddress,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed. Please try again.',
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('referral.referrals.user', 'username firstName lastName')
        .populate('referral.referredBy', 'username firstName lastName');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            walletAddress: user.walletAddress,
            referralCode: user.referral.referralCode,
            referredBy: user.referral.referredBy,
            totalInvestment: user.totalInvestment,
            totalBalance: user.totalBalance,
            dailyEarnings: user.dailyEarnings,
            investments: user.investments,
            referrals: user.referral.referrals,
            totalReferralEarnings: user.referral.totalReferralEarnings,
            team: user.team,
            lastLogin: user.lastLogin,
            registrationDate: user.registrationDate,
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch profile',
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'walletAddress'];
      const updates = {};

      // Only allow specific fields to be updated
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Validate wallet address if provided
      if (updates.walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(updates.walletAddress)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid Ethereum wallet address',
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            walletAddress: user.walletAddress,
            referralCode: user.referral.referralCode,
          },
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          status: 'error',
          message: errorMessages[0],
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to update profile',
      });
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: {
          user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
          },
        },
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Token verification failed',
      });
    }
  },
};

module.exports = authController;