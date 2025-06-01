const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME || 'phantomstake',
    });
    console.log('✅ Connected to MongoDB');

    // Admin accounts to create
    const admins = [
      {
        username: 'admin',
        email: 'admin@phantomstake.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Admin',
      },
      {
        username: 'amankumar',
        email: 'aman@phantomstake.com',
        password: 'Admin123!',
        firstName: 'Aman',
        lastName: 'Kumar',
      },
      {
        username: 'phantom_admin',
        email: 'phantom@phantomstake.com',
        password: 'Admin123!',
        firstName: 'Phantom',
        lastName: 'Admin',
      },
    ];

    for (const adminData of admins) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  Admin ${adminData.username} already exists`);
        continue;
      }

      // Create new admin user
      const admin = new User({
        ...adminData,
        isActive: true,
        isVerified: true,
        wallets: {
          principal: {
            balance: 0,
            locked: false,
            lockExpiry: null,
            totalDeposited: 0,
          },
          income: {
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            daysWithoutWithdrawal: 0,
            compounding: {
              active: false,
              startDate: null,
              rate: 0.01,
              totalCompounded: 0,
              lastCompoundDate: null,
            },
          },
        },
        referral: {
          referralCode: '',
          totalReferralEarnings: 0,
          directReferrals: 0,
          referrals: [],
        },
        team: {
          leftSide: [],
          rightSide: [],
          teamVolume: {
            left: 0,
            right: 0,
            total: 0,
            thirtyDayLeft: 0,
            thirtyDayRight: 0,
            thirtyDayTotal: 0,
          },
          rank: 'Bronze',
          pairs: 0,
          matchingBonus: {
            totalEarned: 0,
            dailyLimit: 2100,
            todayEarned: 0,
            lastResetDate: new Date(),
          },
        },
        mlmEarnings: {
          levelOverrides: {
            totalEarned: 0,
            byLevel: [],
          },
          leadershipPools: {
            totalEarned: 0,
            monthlyEarnings: [],
          },
          milestoneRewards: {
            achieved: [],
            totalValue: 0,
          },
        },
        programData: {
          currentProgram: 'Program I',
          enhancedROI: {
            qualified: false,
            rate: 0.75,
          },
        },
        investments: [],
        transactions: [],
      });

      await admin.save();
      console.log(`✅ Created admin: ${adminData.username} (Password: ${adminData.password})`);
    }

    console.log('\n🎉 Admin seeding completed!');
    console.log('\nYou can now login with:');
    console.log('- Username: admin, Password: Admin123!');
    console.log('- Username: amankumar, Password: Admin123!');
    console.log('- Username: phantom_admin, Password: Admin123!');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmins(); 