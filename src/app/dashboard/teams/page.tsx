"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BinaryTreeVisualization from "@/components/dashboard/BinaryTreeVisualization";

interface TeamMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  position: 'left' | 'right' | 'root';
  referralLevel: number;  // 1 = direct referral, 2 = second level, etc.
  treeNodeLevel: number;  // Physical depth in binary tree (0 = root, 1 = children, etc.)
  personalVolume: number;
  totalInvested: number;
  rank: string;
  isActive: boolean;
  joinDate: string;
  dailyROI: number;
  parentId?: string;
  directReferrals: number;
  teamSize: number;
  sponsorId?: string; // Who referred this person (for level overrides)
  leftChildId?: string;
  rightChildId?: string;
  treePosition: string; // e.g., "L-R-L" = left, then right, then left
}

interface TeamData {
  stats: {
    leftLegVolume: number;
    rightLegVolume: number;
    totalTeamSize: number;
    thirtyDayVolume: number;
    currentRank: string;
    pairsFormed: number;
    matchingBonus: number;
    dailyCapUsed: number;
    dailyCapLimit: number;
    spilloverLeft: number;
    spilloverRight: number;
    maxTreeDepth: number;
  };
  matching: {
    todayPairs: number;
    todayEarnings: number;
    weeklyPairs: number;
    weeklyEarnings: number;
    totalPairs: number;
    totalEarnings: number;
  };
  rankProgress: {
    currentRank: string;
    nextRank: string;
    volumeRequired: number;
    volumeCurrent: number;
    stakeRequired: number;
    stakeCurrent: number;
    progress: number;
  };
  members: TeamMember[];
}

interface TreeStructure {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  position: string;
  referralLevel: number;
  treeNodeLevel: number;
  personalVolume: number;
  leftLegVolume: number;
  rightLegVolume: number;
  totalTeamSize: number;
  treePosition: string;
  isActive: boolean;
  leftChild?: TreeStructure;
  rightChild?: TreeStructure;
  canExpand?: boolean;
}

export default function TeamsPage() {
  const { token } = useAuth();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'members' | 'tree'>('overview');
  const [selectedLevel, setSelectedLevel] = useState<'all' | number>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'volume' | 'team' | 'earnings' | 'referralLevel'>('date');
  const [treeData, setTreeData] = useState<TreeStructure | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      
      const data = await response.json();
      setTeamData(data.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Set empty data structure on error
      setTeamData({
        stats: {
          leftLegVolume: 0,
          rightLegVolume: 0,
          totalTeamSize: 0,
          thirtyDayVolume: 0,
          currentRank: 'Bronze',
          pairsFormed: 0,
          matchingBonus: 0,
          dailyCapUsed: 0,
          dailyCapLimit: 2100,
          spilloverLeft: 0,
          spilloverRight: 0,
          maxTreeDepth: 0,
        },
        matching: {
          todayPairs: 0,
          todayEarnings: 0,
          weeklyPairs: 0,
          weeklyEarnings: 0,
          totalPairs: 0,
          totalEarnings: 0,
        },
        rankProgress: {
          currentRank: 'Bronze',
          nextRank: 'Silver',
          volumeRequired: 50000,
          volumeCurrent: 0,
          stakeRequired: 1000,
          stakeCurrent: 0,
          progress: 0,
        },
        members: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/tree?levels=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tree data');
      }
      
      const data = await response.json();
      setTreeData(data.data.treeStructure);
    } catch (error) {
      console.error('Error fetching tree data:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const queryParams = new URLSearchParams({
        level: selectedLevel.toString(),
        sortBy,
        search: searchTerm,
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/members?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      if (teamData) {
        setTeamData({
          ...teamData,
          members: data.data.members,
        });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'members' && teamData) {
      fetchTeamMembers();
    }
  }, [currentView, selectedLevel, sortBy, searchTerm]);

  useEffect(() => {
    if (currentView === 'tree' && !treeData) {
      fetchTreeData();
    }
  }, [currentView]);

  const calculateMatchingRate = () => {
    const rank = teamData?.stats?.currentRank || 'Bronze';
    const rates = {
      'Bronze': 8,
      'Silver': 9,
      'Gold': 10,
      'Diamond': 11,
      'Ruby': 12
    };
    return rates[rank as keyof typeof rates] || 8;
  };

  const filteredMembers = teamData?.members?.filter(member => {
    const matchesSearch = searchTerm === "" || 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedLevel !== 'all') {
      return matchesSearch && member.referralLevel === selectedLevel;
    }
    
    return matchesSearch;
  }) || [];

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.personalVolume - a.personalVolume;
      case 'team':
        return b.teamSize - a.teamSize;
      case 'earnings':
        return b.dailyROI - a.dailyROI;
      case 'referralLevel':
        return a.referralLevel - b.referralLevel;
      case 'date':
      default:
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-white">Loading team data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teamData) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-white">Failed to load team data. Please try again.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
              <h1 className="text-3xl font-bold mb-3">👥 Your Team ({teamData.stats.totalTeamSize} Members)</h1>
              <p className="text-lg mb-4">
                You&apos;ve earned <span className="font-bold text-green-300">${teamData.matching.totalEarnings}</span> from your team. 
                Tree depth: {teamData.stats.maxTreeDepth} levels.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-green-300 font-bold mb-1">💰 Total Earned</div>
                  <div className="text-2xl font-bold">${teamData.matching.totalEarnings}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-blue-300 font-bold mb-1">👥 Team Size</div>
                  <div className="text-2xl font-bold">{teamData.stats.totalTeamSize}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-purple-300 font-bold mb-1">🏆 Your Rank</div>
                  <div className="text-2xl font-bold">{teamData.stats.currentRank}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-orange-300 font-bold mb-1">⚖️ Tree Depth</div>
                  <div className="text-2xl font-bold">{teamData.stats.maxTreeDepth}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentView === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setCurrentView('members')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentView === 'members' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              👥 Members
            </button>
            <button
              onClick={() => setCurrentView('tree')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentView === 'tree' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🌳 Binary Tree
            </button>
          </div>

          {/* Overview Tab */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-6 border border-green-500/30">
                  <div className="text-green-300 text-sm font-semibold mb-2">💰 LEFT TEAM TOTAL</div>
                  <div className="text-white text-2xl font-bold">${(teamData.stats.leftLegVolume/1000).toFixed(1)}K</div>
                  <div className="text-green-200 text-sm mt-1">
                    Unmatched: ${(teamData.stats.spilloverLeft/1000).toFixed(1)}K
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 border border-blue-500/30">
                  <div className="text-blue-300 text-sm font-semibold mb-2">💰 RIGHT TEAM TOTAL</div>
                  <div className="text-white text-2xl font-bold">${(teamData.stats.rightLegVolume/1000).toFixed(1)}K</div>
                  <div className="text-blue-200 text-sm mt-1">
                    Unmatched: ${(teamData.stats.spilloverRight/1000).toFixed(1)}K
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-6 border border-purple-500/30">
                  <div className="text-purple-300 text-sm font-semibold mb-2">⚖️ MATCHED & EARNING</div>
                  <div className="text-white text-2xl font-bold">
                    ${(Math.min(teamData.stats.leftLegVolume, teamData.stats.rightLegVolume)/1000).toFixed(1)}K
                  </div>
                  <div className="text-purple-200 text-sm mt-1">
                    You earn {calculateMatchingRate()}% = ${teamData.matching.totalEarnings}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-800 to-orange-900 rounded-lg p-6 border border-orange-500/30">
                  <div className="text-orange-300 text-sm font-semibold mb-2">📈 TODAY&apos;S ACTIVITY</div>
                  <div className="text-white text-2xl font-bold">{teamData.matching.todayPairs}</div>
                  <div className="text-orange-200 text-sm mt-1">
                    New matches (+${teamData.matching.todayEarnings})
                  </div>
                </div>
              </div>

              {/* Referral Level Breakdown */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">👥 Team by Referral Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(level => {
                    const levelMembers = teamData.members.filter(m => m.referralLevel === level);
                    const levelVolume = levelMembers.reduce((sum, m) => sum + m.personalVolume, 0);
                    
                    return (
                      <div key={level} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{levelMembers.length}</div>
                          <div className="text-gray-400 text-sm">Referral Level {level}</div>
                          <div className="text-blue-400 text-sm">${(levelVolume/1000).toFixed(1)}K volume</div>
                          <div className="text-green-400 text-xs mt-1">
                            Override: {level === 1 ? '5%' : level === 2 ? '2%' : '1%'}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedLevel(level);
                              setCurrentView('members');
                            }}
                            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            View All
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🏆 Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamData.members
                    .sort((a, b) => b.personalVolume - a.personalVolume)
                    .slice(0, 6)
                    .map((member) => (
                      <div key={member.id} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white font-semibold">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">@{member.username}</div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Investment:</span>
                            <span className="text-white">${member.personalVolume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ref Level:</span>
                            <span className="text-blue-400">{member.referralLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tree Pos:</span>
                            <span className="text-purple-400">{member.treePosition || 'Root'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Team:</span>
                            <span className="text-green-400">{member.teamSize} members</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {currentView === 'members' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search members by name or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-400 text-sm">Referral Level:</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="all">All Levels</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-400 text-sm">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'volume' | 'team' | 'earnings' | 'referralLevel')}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="date">Join Date</option>
                      <option value="volume">Investment</option>
                      <option value="team">Team Size</option>
                      <option value="earnings">Daily ROI</option>
                      <option value="referralLevel">Referral Level</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white">
                    {selectedLevel !== 'all' 
                      ? `Referral Level ${selectedLevel} Members (${sortedMembers.length})`
                      : `All Team Members (${sortedMembers.length})`
                    }
                  </h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {sortedMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <div>
                            <div className="text-white font-semibold">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">@{member.username}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="text-gray-400">Ref Level</div>
                            <div className="text-blue-400 font-semibold">{member.referralLevel}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400">Tree Level</div>
                            <div className="text-purple-400 font-semibold">{member.treeNodeLevel}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400">Investment</div>
                            <div className="text-white font-semibold">${member.personalVolume.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400">Team Size</div>
                            <div className="text-green-400 font-semibold">{member.teamSize}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400">Position</div>
                            <div className="text-orange-400 font-semibold">{member.treePosition || 'Root'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400">Daily ROI</div>
                            <div className="text-green-400 font-semibold">${member.dailyROI.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tree Tab - Binary Tree Visualization */}
          {currentView === 'tree' && (
            <div className="bg-gray-800/50 rounded-xl p-6 min-h-96">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">🌳 Binary Tree Visualization</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    Real-time MLM binary tree • Infinite canvas • Hover for details
                  </div>
                </div>
              </div>
              
              {/* Educational Note */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h4 className="text-blue-300 font-semibold mb-2">Understanding Your Team Structure:</h4>
                <div className="text-white text-sm space-y-2">
                  <div>
                    <strong>Binary Tree:</strong> Your team is organized like a family tree with only 2 branches (left & right). 
                    New members are automatically placed to keep both sides balanced.
                  </div>
                  <div>
                    <strong>Matching Bonus:</strong> When both your left and right teams grow equally, you earn a bonus! 
                    Think of it like keeping a scale balanced - you earn {calculateMatchingRate()}% when volumes match.
                  </div>
                  <div>
                    <strong>Spillover:</strong> Extra volume on one side that&apos;s waiting to be matched. 
                    Like having $1,000 on the left but only $800 on the right - the extra $200 &ldquo;spills over&rdquo; for future matching.
                  </div>
                  <div>
                    <strong>Tree Position (e.g., L-R-L):</strong> Shows exactly where someone sits in your tree. 
                    L = Left branch, R = Right branch. It&apos;s like GPS directions to find them!
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 mt-2">
                    <strong className="text-yellow-300">💡 Simple Example:</strong> 
                    <span className="text-yellow-200"> If your left team has $10,000 volume and right team has $8,000, 
                    you earn {calculateMatchingRate()}% of $8,000 (the matched amount). The extra $2,000 waits for more right-side growth!</span>
                  </div>
                </div>
              </div>

              <div style={{ height: '600px' }}>
                {treeData ? (
                  <BinaryTreeVisualization
                    rootMember={convertTreeStructureToMember(treeData)}
                    allMembers={extractAllMembersFromTree(treeData)}
                    maxInitialLevels={10}
                    onMemberSelect={(member: TeamMember) => setSelectedMember(member)}
                    onLoadMoreLevels={async (parentId: string): Promise<TeamMember[]> => {
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/tree/expand`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ parentId, levels: 5 }),
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to expand tree');
                        }
                        
                        const data = await response.json();
                        return data.data;
                      } catch (error) {
                        console.error('Error expanding tree:', error);
                        return [];
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white">Loading tree visualization...</div>
                  </div>
                )}
              </div>

              {/* Tree Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{teamData.stats.maxTreeDepth}</div>
                  <div className="text-gray-400 text-sm">Maximum Tree Depth</div>
                  <div className="text-blue-400 text-xs mt-1">Levels visible in tree</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{Math.min(teamData.stats.leftLegVolume, teamData.stats.rightLegVolume)}</div>
                  <div className="text-gray-400 text-sm">Matched Volume</div>
                  <div className="text-green-400 text-xs mt-1">Qualifying for matching bonus</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{teamData.stats.pairsFormed}</div>
                  <div className="text-gray-400 text-sm">Total Pairs Formed</div>
                  <div className="text-purple-400 text-xs mt-1">All-time pair count</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{calculateMatchingRate()}%</div>
                  <div className="text-gray-400 text-sm">Current Match Rate</div>
                  <div className="text-orange-400 text-xs mt-1">{teamData.stats.currentRank} rank bonus</div>
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">🔧 Advanced Tree Controls:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    onClick={() => {
                      // In production: center tree on root
                      console.log('Centering tree on root...');
                    }}
                  >
                    🎯 Center on Root
                  </button>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    onClick={() => {
                      // In production: expand all visible levels
                      console.log('Expanding all levels...');
                    }}
                  >
                    📈 Expand All
                  </button>
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    onClick={() => {
                      // In production: export tree data
                      console.log('Exporting tree data...');
                    }}
                  >
                    💾 Export Tree
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Member Details Modal */}
          {selectedMember && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Member Details</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </div>
                    <div className="text-gray-400">@{selectedMember.username}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                      selectedMember.isActive 
                        ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {selectedMember.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Investment</div>
                      <div className="text-white font-bold text-lg">${selectedMember.personalVolume.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Daily ROI</div>
                      <div className="text-green-400 font-bold text-lg">${selectedMember.dailyROI.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Referral Level</div>
                      <div className="text-blue-400 font-bold text-lg">{selectedMember.referralLevel}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Tree Level</div>
                      <div className="text-purple-400 font-bold text-lg">{selectedMember.treeNodeLevel}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Tree Position</div>
                      <div className="text-orange-400 font-bold text-lg">{selectedMember.treePosition || 'Root'}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Team Size</div>
                      <div className="text-green-400 font-bold text-lg">{selectedMember.teamSize}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Joined</div>
                    <div className="text-white">{new Date(selectedMember.joinDate).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-300 text-sm font-semibold">Your Earnings from this Member:</div>
                    <div className="text-white text-sm space-y-1">
                      <div>• Level {selectedMember.referralLevel} Override: {selectedMember.referralLevel === 1 ? '5%' : selectedMember.referralLevel === 2 ? '2%' : '1%'} of their activity</div>
                      <div>• Binary Matching: When their volume pairs with opposite leg</div>
                      <div>• Tree Position: {selectedMember.treePosition || 'Root'} (affects leg volumes)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper functions to convert tree structure
function convertTreeStructureToMember(tree: TreeStructure): TeamMember {
  return {
    id: tree.id,
    username: tree.username,
    firstName: tree.firstName,
    lastName: tree.lastName,
    position: tree.position as 'left' | 'right' | 'root',
    referralLevel: tree.referralLevel,
    treeNodeLevel: tree.treeNodeLevel,
    personalVolume: tree.personalVolume,
    totalInvested: tree.personalVolume,
    rank: 'Bronze', // Default, should come from backend
    isActive: tree.isActive,
    joinDate: new Date().toISOString(),
    dailyROI: tree.personalVolume * 0.0075,
    directReferrals: 0,
    teamSize: tree.totalTeamSize,
    treePosition: tree.treePosition,
    leftChildId: tree.leftChild?.id,
    rightChildId: tree.rightChild?.id,
  };
}

function extractAllMembersFromTree(tree: TreeStructure): TeamMember[] {
  const members: TeamMember[] = [];
  
  function traverse(node: TreeStructure) {
    members.push(convertTreeStructureToMember(node));
    if (node.leftChild) traverse(node.leftChild);
    if (node.rightChild) traverse(node.rightChild);
  }
  
  traverse(tree);
  return members;
} 