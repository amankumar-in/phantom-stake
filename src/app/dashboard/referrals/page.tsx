"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Copy, Check, Search, Filter, Download, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface DirectReferral {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dateReferred: string;
  personalVolume: number;
  leftLegVolume: number;
  rightLegVolume: number;
  teamSize: number;
  treePosition: string;
  commission: number;
  totalCommissionEarned: number;
  totalInvestment: number;
  currentBalance: number;
  status: 'active' | 'inactive';
}

interface LevelOverride {
  level: number;
  totalAmount: number;
  count: number;
  uniqueMembers: number;
}

interface OverrideDetail {
  id: string;
  sourceUserId: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  referralLevel: number;
  activityType: string;
  activityAmount: number;
  overrideAmount: number;
  date: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: number;
  totalVolume: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  averageReferralValue: number;
}

export default function ReferralsPage() {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referrals, setReferrals] = useState<DirectReferral[]>([]);
  const [levelOverrides, setLevelOverrides] = useState<LevelOverride[]>([]);
  const [overrideHistory, setOverrideHistory] = useState<OverrideDetail[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    totalVolume: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    averageReferralValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'overview' | 'referrals' | 'overrides'>('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'volume' | 'commission'>('date');
  const [selectedReferral, setSelectedReferral] = useState<DirectReferral | null>(null);

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user?.referralCode || ''}`;

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch direct referrals
      const referralsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/referrals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!referralsResponse.ok) throw new Error('Failed to fetch referrals');
      
      const referralsData = await referralsResponse.json();
      setReferrals(referralsData.data.referrals);
      setStats({
        ...stats,
        totalReferrals: referralsData.data.summary.totalReferrals,
        activeReferrals: referralsData.data.summary.activeReferrals,
        totalCommissions: referralsData.data.summary.totalCommissions,
        totalVolume: referralsData.data.summary.totalVolume,
        averageReferralValue: referralsData.data.summary.totalVolume / Math.max(1, referralsData.data.summary.totalReferrals),
      });
      
      // Fetch level override data
      const overridesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/overrides`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (overridesResponse.ok) {
        const overridesData = await overridesResponse.json();
        setLevelOverrides(overridesData.data.levelBreakdown);
        setOverrideHistory(overridesData.data.history);
        
        // Calculate earnings
        const todayOverrides = overridesData.data.history.filter((o: OverrideDetail) => {
          const overrideDate = new Date(o.date);
          const today = new Date();
          return overrideDate.toDateString() === today.toDateString();
        });
        
        const weekOverrides = overridesData.data.history.filter((o: OverrideDetail) => {
          const overrideDate = new Date(o.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return overrideDate >= weekAgo;
        });
        
        setStats(prev => ({
          ...prev,
          todayEarnings: todayOverrides.reduce((sum: number, o: OverrideDetail) => sum + o.overrideAmount, 0),
          weeklyEarnings: weekOverrides.reduce((sum: number, o: OverrideDetail) => sum + o.overrideAmount, 0),
          monthlyEarnings: overridesData.data.totalStats.totalAmount || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReferralData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = searchTerm === "" || 
      referral.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && referral.status === 'active') ||
      (filterStatus === 'inactive' && referral.status === 'inactive');
    
    return matchesSearch && matchesFilter;
  });

  const sortedReferrals = [...filteredReferrals].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.personalVolume - a.personalVolume;
      case 'commission':
        return b.totalCommissionEarned - a.totalCommissionEarned;
      case 'date':
      default:
        return new Date(b.dateReferred).getTime() - new Date(a.dateReferred).getTime();
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-white">Loading referral data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Referral Link */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
              <h1 className="text-3xl font-bold mb-3">🎯 Your Referral Network</h1>
              <p className="text-lg mb-4">
                You&apos;ve referred <span className="font-bold text-yellow-300">{stats.totalReferrals}</span> members
                and earned <span className="font-bold text-green-300">${stats.totalCommissions.toFixed(2)}</span> in commissions!
              </p>
              
              {/* Referral Link Section */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Referral Code */}
                  <div>
                    <div className="text-sm font-semibold mb-2">📱 Your Referral Code:</div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 border border-white/30 rounded px-4 py-2 text-xl font-bold">
                        {user?.referralCode || 'Loading...'}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user?.referralCode || '');
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded transition-colors"
                        title="Copy code"
                      >
                        {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-xs mt-1 text-yellow-200">
                      Share this code directly with friends
                    </div>
                  </div>

                  {/* QR Code or Visual Element */}
                  <div className="flex items-center justify-center md:justify-end">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">10%</div>
                      <div className="text-xs text-white">Instant Bonus</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="text-sm font-semibold mb-2">📨 Your Unique Referral Link:</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 bg-white/20 border border-white/30 rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-xs mt-2 text-yellow-200">
                    Share this link to earn 10% commission on all deposits from your referrals!
                  </div>
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
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setCurrentView('referrals')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentView === 'referrals' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              👥 Direct Referrals
            </button>
            <button
              onClick={() => setCurrentView('overrides')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentView === 'overrides' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📈 Level Overrides
            </button>
          </div>

          {/* Overview Tab */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-300" />
                    <div className="text-xs text-purple-300">Total Network</div>
                  </div>
                  <div className="text-white text-2xl font-bold">{stats.totalReferrals}</div>
                  <div className="text-purple-200 text-sm mt-1">
                    {stats.activeReferrals} active
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-6 border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-green-300" />
                    <div className="text-xs text-green-300">Total Earned</div>
                  </div>
                  <div className="text-white text-2xl font-bold">${stats.totalCommissions.toFixed(2)}</div>
                  <div className="text-green-200 text-sm mt-1">
                    + ${stats.monthlyEarnings.toFixed(2)} overrides
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-300" />
                    <div className="text-xs text-blue-300">Network Volume</div>
                  </div>
                  <div className="text-white text-2xl font-bold">${(stats.totalVolume/1000).toFixed(1)}K</div>
                  <div className="text-blue-200 text-sm mt-1">
                    Avg: ${stats.averageReferralValue.toFixed(0)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-800 to-orange-900 rounded-lg p-6 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-orange-300" />
                    <div className="text-xs text-orange-300">Today&apos;s Earnings</div>
                  </div>
                  <div className="text-white text-2xl font-bold">${stats.todayEarnings.toFixed(2)}</div>
                  <div className="text-orange-200 text-sm mt-1">
                    Week: ${stats.weeklyEarnings.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">💰 How You Earn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-300 font-semibold mb-3">🎁 One-Time Welcome Bonus</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white">
                        <span>When someone joins:</span>
                        <span className="font-bold text-green-400">10%</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Example:</span>
                        <span>$1,000 deposit = $100 for you</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>When paid:</span>
                        <span>Instantly (one time only)</span>
                      </div>
                      <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 mt-2">
                        <p className="text-yellow-200 text-xs">
                          <strong>Note:</strong> This 10% bonus is paid only on their first deposit when they join using your link.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-3">💸 Lifetime Earnings (Overrides)</h4>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-300 text-xs mb-2">
                        Earn from your team&apos;s daily profits & future deposits:
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Your direct referrals:</span>
                        <span className="font-bold text-green-400">5% daily</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Their referrals:</span>
                        <span className="font-bold text-green-400">2% daily</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>3 levels down:</span>
                        <span className="font-bold text-green-400">1% daily</span>
                      </div>
                      <div className="bg-blue-900/30 border border-blue-500/30 rounded p-2 mt-2">
                        <p className="text-blue-200 text-xs">
                          <strong>Example:</strong> If John (your referral) earns $10 daily, you get $0.50 every day forever!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Distribution */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">📊 Your Team&apos;s Earnings Tree</h3>
                <p className="text-gray-400 text-sm mb-4">
                  This shows how deep your referral network goes and how much you&apos;re earning from each level. 
                  Think of it like a family tree - Level 1 are people you invited, Level 2 are people they invited, and so on!
                </p>
                <div className="space-y-3">
                  {levelOverrides.map((level) => (
                    <div key={level.level} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            {level.level === 1 ? 'Your Direct Invites' : 
                             level.level === 2 ? 'People They Invited' : 
                             `${level.level} Levels Away`}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {level.uniqueMembers} {level.uniqueMembers === 1 ? 'person' : 'people'} • {level.count} payments
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg">
                            ${level.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            You earn {level.level === 1 ? '5%' : level.level === 2 ? '2%' : level.level <= 5 ? '1%' : level.level <= 8 ? '0.5%' : '0.25%'} from this level
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-600/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                          style={{ width: `${Math.min((level.totalAmount / Math.max(...levelOverrides.map(l => l.totalAmount))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Direct Referrals Tab */}
          {currentView === 'referrals' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search referrals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-400 text-sm">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'volume' | 'commission')}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="date">Join Date</option>
                      <option value="volume">Investment</option>
                      <option value="commission">Commission Earned</option>
                    </select>
                  </div>
                  
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white">
                    Direct Referrals ({sortedReferrals.length})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 text-left">
                        <th className="px-6 py-4 text-gray-400 font-medium">Member</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Join Date</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Investment</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Team Size</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Commission</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Status</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedReferrals.map((referral) => (
                        <tr key={referral.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-white font-semibold">
                                {referral.firstName} {referral.lastName}
                              </div>
                              <div className="text-gray-400 text-sm">@{referral.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white">
                            {new Date(referral.dateReferred).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-white">
                            ${referral.personalVolume.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-white">
                            {referral.teamSize}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-green-400 font-semibold">
                              ${referral.totalCommissionEarned.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              referral.status === 'active' 
                                ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {referral.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedReferral(referral)}
                              className="text-purple-400 hover:text-purple-300 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Level Overrides Tab */}
          {currentView === 'overrides' && (
            <div className="space-y-6">
              {/* Recent Override Transactions */}
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white">
                    Recent Level Override Earnings
                  </h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {overrideHistory.slice(0, 50).map((override) => (
                    <div key={override.id} className="p-4 border-b border-gray-700/50 hover:bg-gray-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            {override.sourceUserId.firstName} {override.sourceUserId.lastName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            @{override.sourceUserId.username} • Level {override.referralLevel} • {override.activityType.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            +${override.overrideAmount.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {new Date(override.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Override Statistics */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📈 Override Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {levelOverrides.reduce((sum, l) => sum + l.uniqueMembers, 0)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Total Override Members</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      ${levelOverrides.reduce((sum, l) => sum + l.totalAmount, 0).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Total Override Earnings</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {Math.max(...levelOverrides.map(l => l.level), 0)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Deepest Active Level</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Referral Details Modal */}
          {selectedReferral && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Referral Details</h3>
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedReferral.firstName} {selectedReferral.lastName}
                    </div>
                    <div className="text-gray-400">@{selectedReferral.username}</div>
                    <div className="text-gray-400 text-sm">{selectedReferral.email}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Join Date</div>
                      <div className="text-white font-bold">
                        {new Date(selectedReferral.dateReferred).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Status</div>
                      <div className={`font-bold ${selectedReferral.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                        {selectedReferral.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Investment</div>
                      <div className="text-white font-bold">
                        ${selectedReferral.personalVolume.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Commission Earned</div>
                      <div className="text-green-400 font-bold">
                        ${selectedReferral.totalCommissionEarned.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Team Size</div>
                      <div className="text-white font-bold">{selectedReferral.teamSize}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400">Tree Position</div>
                      <div className="text-purple-400 font-bold">
                        {selectedReferral.treePosition || 'Root'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-300 text-sm font-semibold mb-2">Earnings Breakdown:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-white">
                        <span>Direct Referral (10%):</span>
                        <span className="font-bold">${(selectedReferral.personalVolume * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Level 1 Override (5%):</span>
                        <span className="font-bold">Active</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Binary Placement:</span>
                        <span className="text-purple-400">{selectedReferral.treePosition}</span>
                      </div>
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