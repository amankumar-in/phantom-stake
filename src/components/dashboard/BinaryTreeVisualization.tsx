"use client";

import React, { useState, useEffect, useRef } from 'react';

interface TeamMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  position: 'left' | 'right' | 'root';
  referralLevel: number;
  treeNodeLevel: number;
  personalVolume: number;
  totalInvested: number;
  rank: string;
  isActive: boolean;
  joinDate: string;
  dailyROI: number;
  parentId?: string;
  directReferrals: number;
  teamSize: number;
  sponsorId?: string;
  leftChildId?: string;
  rightChildId?: string;
  treePosition: string;
}

interface BinaryTreeVisualizationProps {
  rootMember: TeamMember;
  allMembers: TeamMember[];
  maxInitialLevels?: number;
  onMemberSelect?: (member: TeamMember) => void;
  onLoadMoreLevels?: (parentId: string) => Promise<TeamMember[]>;
}

interface HoverTooltip {
  member: TeamMember;
  x: number;
  y: number;
  visible: boolean;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;
const LEVEL_HEIGHT = 150;
const NODE_SPACING_X = 50;

const BinaryTreeVisualization: React.FC<BinaryTreeVisualizationProps> = ({
  rootMember,
  allMembers,
  maxInitialLevels = 5,
  onMemberSelect,
  onLoadMoreLevels
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredMember, setHoveredMember] = useState<HoverTooltip>({
    member: rootMember,
    x: 0,
    y: 0,
    visible: false
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Build member lookup map
  const memberMap = new Map(allMembers.map(m => [m.id, m]));

  // Calculate tree positions using simple binary tree layout
  const calculateTreePositions = () => {
    const positions = new Map<string, { x: number; y: number; level: number }>();
    const containerWidth = containerRef.current?.clientWidth || 1200;
    
    // Start with root at center
    const rootX = containerWidth / 2;
    const rootY = 50;
    
    // BFS to calculate positions
    const queue: Array<{ member: TeamMember; x: number; y: number; level: number; width: number }> = [
      { member: rootMember, x: rootX, y: rootY, level: 0, width: containerWidth }
    ];
    
    while (queue.length > 0) {
      const { member, x, y, level, width } = queue.shift()!;
      
      positions.set(member.id, { x, y, level });
      
      // Add children if they exist and we haven't reached max levels
      if (level < maxInitialLevels) {
        const childWidth = width / 2;
        const childY = y + LEVEL_HEIGHT;
        
        if (member.leftChildId && memberMap.has(member.leftChildId)) {
          const leftChild = memberMap.get(member.leftChildId)!;
          const leftX = x - childWidth / 2;
          queue.push({ member: leftChild, x: leftX, y: childY, level: level + 1, width: childWidth });
        }
        
        if (member.rightChildId && memberMap.has(member.rightChildId)) {
          const rightChild = memberMap.get(member.rightChildId)!;
          const rightX = x + childWidth / 2;
          queue.push({ member: rightChild, x: rightX, y: childY, level: level + 1, width: childWidth });
        }
      }
    }
    
    return positions;
  };

  const positions = calculateTreePositions();

  // Get node color based on rank
  const getNodeColor = (member: TeamMember) => {
    if (!member.isActive) return 'bg-gray-600 border-gray-500';
    switch (member.rank) {
      case 'Diamond': return 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400';
      case 'Gold': return 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400';
      case 'Silver': return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300';
      default: return 'bg-gradient-to-br from-green-500 to-green-700 border-green-400';
    }
  };

  // Handle member click
  const handleMemberClick = (member: TeamMember) => {
    setSelectedMemberId(member.id);
    onMemberSelect?.(member);
  };

  // Handle member hover
  const handleMemberHover = (member: TeamMember, event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setHoveredMember({
        member,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true
      });
    }
  };

  const handleMemberLeave = () => {
    setHoveredMember(prev => ({ ...prev, visible: false }));
  };

  // Handle canvas drag
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 50 });
  };

  // Search functionality
  const searchMembers = (term: string) => {
    const found = allMembers.find(member =>
      member.firstName.toLowerCase().includes(term.toLowerCase()) ||
      member.lastName.toLowerCase().includes(term.toLowerCase()) ||
      member.username.toLowerCase().includes(term.toLowerCase())
    );
    
    if (found) {
      setSelectedMemberId(found.id);
      onMemberSelect?.(found);
    }
  };

  // Render connection lines
  const renderConnections = () => {
    const connections: React.ReactNode[] = [];
    
    positions.forEach((pos, memberId) => {
      const member = memberMap.get(memberId);
      if (!member) return;
      
      // Draw line to left child
      if (member.leftChildId && positions.has(member.leftChildId)) {
        const childPos = positions.get(member.leftChildId)!;
        connections.push(
          <line
            key={`left-${memberId}`}
            x1={pos.x}
            y1={pos.y + NODE_HEIGHT}
            x2={childPos.x}
            y2={childPos.y}
            stroke="#6B7280"
            strokeWidth="2"
            className="opacity-60"
          />
        );
      }
      
      // Draw line to right child
      if (member.rightChildId && positions.has(member.rightChildId)) {
        const childPos = positions.get(member.rightChildId)!;
        connections.push(
          <line
            key={`right-${memberId}`}
            x1={pos.x}
            y1={pos.y + NODE_HEIGHT}
            x2={childPos.x}
            y2={childPos.y}
            stroke="#6B7280"
            strokeWidth="2"
            className="opacity-60"
          />
        );
      }
    });
    
    return connections;
  };

  // Render tree nodes
  const renderNodes = () => {
    const nodes: React.ReactNode[] = [];
    
    positions.forEach((pos, memberId) => {
      const member = memberMap.get(memberId);
      if (!member) return;
      
      const isSelected = selectedMemberId === member.id;
      
      nodes.push(
        <div
          key={member.id}
          className={`
            absolute cursor-pointer transition-all duration-200 hover:scale-105 z-10
            w-44 h-24 rounded-lg border-2 p-3 text-white text-xs
            ${getNodeColor(member)}
            ${isSelected ? 'ring-4 ring-blue-400 scale-110' : ''}
          `}
          style={{
            left: pos.x - NODE_WIDTH / 2,
            top: pos.y,
            width: NODE_WIDTH,
            height: NODE_HEIGHT
          }}
          onClick={() => handleMemberClick(member)}
          onMouseEnter={(e) => handleMemberHover(member, e)}
          onMouseLeave={handleMemberLeave}
        >
          {/* Member Info */}
          <div className="font-bold truncate text-sm">
            {member.firstName} {member.lastName}
          </div>
          <div className="text-gray-200 truncate text-xs">
            @{member.username}
          </div>
          <div className="mt-1 flex justify-between text-xs">
            <span>${(member.personalVolume/1000).toFixed(1)}K</span>
            <span className="text-yellow-300">L{member.referralLevel}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>{member.teamSize} team</span>
            <span className={member.isActive ? 'text-green-300' : 'text-red-300'}>
              {member.isActive ? '●' : '○'}
            </span>
          </div>

          {/* Rank indicator */}
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white text-xs flex items-center justify-center font-bold ${
            member.rank === 'Diamond' ? 'bg-blue-500' :
            member.rank === 'Gold' ? 'bg-yellow-500' :
            member.rank === 'Silver' ? 'bg-gray-400' : 'bg-green-500'
          }`}>
            {member.rank.charAt(0)}
          </div>
        </div>
      );
    });
    
    return nodes;
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-4">
        <div className="bg-gray-800/90 rounded-lg p-2 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMembers(searchTerm)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm w-48"
          />
          <button
            onClick={() => searchMembers(searchTerm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={() => handleZoom(0.1)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center"
        >
          +
        </button>
        <div className="bg-gray-800/90 text-white px-2 py-1 rounded text-sm text-center">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => handleZoom(-0.1)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="bg-gray-800/90 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          Reset
        </button>
      </div>

      {/* Tree Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center top',
            width: '100%',
            height: '100%',
            minHeight: '1000px'
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {renderConnections()}
          </svg>

          {/* Tree Nodes */}
          {renderNodes()}
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredMember.visible && (
        <div
          className="absolute z-30 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white text-sm shadow-lg pointer-events-none"
          style={{
            left: hoveredMember.x + 10,
            top: hoveredMember.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-bold">{hoveredMember.member.firstName} {hoveredMember.member.lastName}</div>
          <div className="text-gray-400">@{hoveredMember.member.username}</div>
          <div className="border-t border-gray-600 mt-2 pt-2 space-y-1">
            <div>Investment: <span className="text-green-400">${hoveredMember.member.personalVolume.toLocaleString()}</span></div>
            <div>Daily ROI: <span className="text-blue-400">${hoveredMember.member.dailyROI.toFixed(2)}</span></div>
            <div>Team Size: <span className="text-purple-400">{hoveredMember.member.teamSize}</span></div>
            <div>Referral Level: <span className="text-yellow-400">{hoveredMember.member.referralLevel}</span></div>
            <div>Tree Level: <span className="text-orange-400">{hoveredMember.member.treeNodeLevel}</span></div>
            <div>Position: <span className="text-pink-400">{hoveredMember.member.treePosition || 'Root'}</span></div>
            <div>Rank: <span className={`font-bold ${
              hoveredMember.member.rank === 'Diamond' ? 'text-blue-400' :
              hoveredMember.member.rank === 'Gold' ? 'text-yellow-400' :
              hoveredMember.member.rank === 'Silver' ? 'text-gray-400' : 'text-green-400'
            }`}>{hoveredMember.member.rank}</span></div>
            <div>Status: <span className={hoveredMember.member.isActive ? 'text-green-400' : 'text-red-400'}>
              {hoveredMember.member.isActive ? 'Active' : 'Inactive'}
            </span></div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-gray-800/90 rounded-lg p-3 text-white text-xs">
        <div className="font-bold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Bronze</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Silver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Gold</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Diamond</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div>● Active • ○ Inactive</div>
          <div>Drag to pan • Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
};

export default BinaryTreeVisualization; 