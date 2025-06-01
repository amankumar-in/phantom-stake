const mongoose = require('mongoose');

const treeNodeSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Binary tree structure
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreeNode',
    default: null, // null for root
  },
  
  leftChildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreeNode',
    default: null,
  },
  
  rightChildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreeNode',
    default: null,
  },
  
  // Sponsorship tracking (who referred them)
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Position in parent's tree
  position: {
    type: String,
    enum: ['left', 'right', 'root'],
    required: true,
  },
  
  // Tree navigation path (e.g., "L-R-L")
  treePosition: {
    type: String,
    default: '',
  },
  
  // Levels
  treeNodeLevel: {
    type: Number,
    default: 0, // 0 = root, 1 = direct children, etc.
    index: true,
  },
  
  referralLevel: {
    type: Number,
    required: true, // 1 = direct referral, 2 = referral's referral, etc.
    index: true,
  },
  
  // Volume tracking (cached for performance)
  personalVolume: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  leftLegVolume: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  rightLegVolume: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Team statistics
  leftLegCount: {
    type: Number,
    default: 0,
  },
  
  rightLegCount: {
    type: Number,
    default: 0,
  },
  
  totalTeamSize: {
    type: Number,
    default: 0,
  },
  
  // Activity tracking
  isActive: {
    type: Boolean,
    default: true,
  },
  
  lastVolumeUpdate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
treeNodeSchema.index({ userId: 1 });
treeNodeSchema.index({ parentId: 1, position: 1 });
treeNodeSchema.index({ sponsorId: 1 });
treeNodeSchema.index({ treeNodeLevel: 1 });
treeNodeSchema.index({ referralLevel: 1, sponsorId: 1 });

// Virtual for spillover volumes
treeNodeSchema.virtual('spilloverLeft').get(function() {
  const matched = Math.min(this.leftLegVolume, this.rightLegVolume);
  return Math.max(0, this.leftLegVolume - matched);
});

treeNodeSchema.virtual('spilloverRight').get(function() {
  const matched = Math.min(this.leftLegVolume, this.rightLegVolume);
  return Math.max(0, this.rightLegVolume - matched);
});

// Virtual for matched volume
treeNodeSchema.virtual('matchedVolume').get(function() {
  return Math.min(this.leftLegVolume, this.rightLegVolume);
});

// Method to update volume from children
treeNodeSchema.methods.updateVolumesFromChildren = async function() {
  const TreeNode = this.constructor;
  
  // Get left child total volume
  if (this.leftChildId) {
    const leftChild = await TreeNode.findById(this.leftChildId);
    if (leftChild) {
      this.leftLegVolume = leftChild.personalVolume + leftChild.leftLegVolume + leftChild.rightLegVolume;
      this.leftLegCount = 1 + leftChild.totalTeamSize;
    }
  } else {
    this.leftLegVolume = 0;
    this.leftLegCount = 0;
  }
  
  // Get right child total volume
  if (this.rightChildId) {
    const rightChild = await TreeNode.findById(this.rightChildId);
    if (rightChild) {
      this.rightLegVolume = rightChild.personalVolume + rightChild.leftLegVolume + rightChild.rightLegVolume;
      this.rightLegCount = 1 + rightChild.totalTeamSize;
    }
  } else {
    this.rightLegVolume = 0;
    this.rightLegCount = 0;
  }
  
  this.totalTeamSize = this.leftLegCount + this.rightLegCount;
  this.lastVolumeUpdate = new Date();
  
  await this.save();
  
  // Propagate update to parent
  if (this.parentId) {
    const parent = await TreeNode.findById(this.parentId);
    if (parent) {
      await parent.updateVolumesFromChildren();
    }
  }
};

// Static method to find first available position
treeNodeSchema.statics.findFirstAvailablePosition = async function(startNodeId, preferredLeg = 'left') {
  const TreeNode = this;
  const queue = [];
  
  const startNode = await TreeNode.findById(startNodeId);
  if (!startNode) throw new Error('Start node not found');
  
  // Start with preferred leg
  if (preferredLeg === 'left' && !startNode.leftChildId) {
    return {
      parentId: startNode._id,
      position: 'left',
      treePosition: startNode.treePosition ? `${startNode.treePosition}-L` : 'L',
      level: startNode.treeNodeLevel + 1,
    };
  } else if (preferredLeg === 'right' && !startNode.rightChildId) {
    return {
      parentId: startNode._id,
      position: 'right',
      treePosition: startNode.treePosition ? `${startNode.treePosition}-R` : 'R',
      level: startNode.treeNodeLevel + 1,
    };
  }
  
  // If preferred position is taken, use breadth-first search
  queue.push(startNode);
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    // Check left position
    if (!node.leftChildId) {
      return {
        parentId: node._id,
        position: 'left',
        treePosition: node.treePosition ? `${node.treePosition}-L` : 'L',
        level: node.treeNodeLevel + 1,
      };
    }
    
    // Check right position
    if (!node.rightChildId) {
      return {
        parentId: node._id,
        position: 'right',
        treePosition: node.treePosition ? `${node.treePosition}-R` : 'R',
        level: node.treeNodeLevel + 1,
      };
    }
    
    // Add children to queue for next level
    if (node.leftChildId) {
      const leftChild = await TreeNode.findById(node.leftChildId);
      if (leftChild) queue.push(leftChild);
    }
    
    if (node.rightChildId) {
      const rightChild = await TreeNode.findById(node.rightChildId);
      if (rightChild) queue.push(rightChild);
    }
  }
  
  throw new Error('No available position found');
};

// Static method to calculate referral level
treeNodeSchema.statics.calculateReferralLevel = async function(sponsorId, newUserId) {
  const User = mongoose.model('User');
  let level = 1;
  let currentSponsor = await User.findById(sponsorId);
  
  // If sponsor is the root user, referral level is 1
  if (!currentSponsor.referral.referredBy) {
    return 1;
  }
  
  // Traverse up the sponsorship chain
  while (currentSponsor && currentSponsor.referral.referredBy) {
    level++;
    currentSponsor = await User.findById(currentSponsor.referral.referredBy);
  }
  
  return level;
};

module.exports = mongoose.model('TreeNode', treeNodeSchema); 