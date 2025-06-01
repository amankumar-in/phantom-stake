const mongoose = require('mongoose');
const User = require('../models/User');
const TreeNode = require('../models/TreeNode');
const mlmService = require('../services/mlmService');

/**
 * Initialize binary tree nodes for existing users
 * This should be run once to set up the tree structure
 */
async function initializeBinaryTree() {
  try {
    console.log('Starting binary tree initialization...');
    
    // Get all users ordered by registration date
    const users = await User.find({}).sort({ createdAt: 1 });
    
    if (users.length === 0) {
      console.log('No users found to initialize');
      return;
    }
    
    console.log(`Found ${users.length} users to process`);
    
    // Process first user as root
    const rootUser = users[0];
    const existingRootNode = await TreeNode.findOne({ userId: rootUser._id });
    
    if (!existingRootNode) {
      console.log(`Creating root node for ${rootUser.username}`);
      const rootNode = new TreeNode({
        userId: rootUser._id,
        parentId: null,
        sponsorId: rootUser._id,
        position: 'root',
        treePosition: '',
        treeNodeLevel: 0,
        referralLevel: 0,
        personalVolume: rootUser.wallets.principal.totalDeposited || 0,
        leftLegVolume: 0,
        rightLegVolume: 0,
        isActive: true,
      });
      await rootNode.save();
    }
    
    // Process remaining users
    for (let i = 1; i < users.length; i++) {
      const user = users[i];
      
      // Check if node already exists
      const existingNode = await TreeNode.findOne({ userId: user._id });
      if (existingNode) {
        console.log(`Node already exists for ${user.username}, skipping...`);
        continue;
      }
      
      console.log(`Processing user ${i}/${users.length}: ${user.username}`);
      
      // Determine sponsor
      let sponsorId = user.referral.referredBy;
      if (!sponsorId) {
        // If no referrer, use the root user as sponsor
        sponsorId = rootUser._id;
      }
      
      try {
        // Auto-place in binary tree
        await mlmService.autoPlaceNewMember(user._id, sponsorId);
        
        // Update personal volume if user has deposits
        if (user.wallets.principal.totalDeposited > 0) {
          await mlmService.updatePersonalVolume(user._id, user.wallets.principal.totalDeposited);
        }
        
        console.log(`✓ Successfully placed ${user.username} in tree`);
      } catch (error) {
        console.error(`✗ Error placing ${user.username}:`, error.message);
      }
    }
    
    console.log('Binary tree initialization complete!');
    
    // Print tree statistics
    const totalNodes = await TreeNode.countDocuments();
    const maxDepth = await TreeNode.findOne().sort({ treeNodeLevel: -1 }).select('treeNodeLevel');
    
    console.log('\nTree Statistics:');
    console.log(`- Total nodes: ${totalNodes}`);
    console.log(`- Maximum depth: ${maxDepth?.treeNodeLevel || 0}`);
    
  } catch (error) {
    console.error('Error initializing binary tree:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = initializeBinaryTree;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phantom-stake', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    return initializeBinaryTree();
  })
  .then(() => {
    console.log('Job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Job failed:', error);
    process.exit(1);
  });
} 