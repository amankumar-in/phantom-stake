"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";

interface PoolData {
  currentPool: {
    month: string;
    totalDeposits: number;
    pools: {
      silver: { total: number; members: number; perMember: number };
      gold: { total: number; members: number; perMember: number };
      diamond: { total: number; members: number; perMember: number };
      ruby: { total: number; members: number; perMember: number };
    };
  };
  userRank: string;
  eligibility: {
    qualified: boolean;
    rank: string;
    poolPercentage: number;
    estimatedShare: number;
  };
  history: Array<{
    month: string;
    rank: string;
    amount: number;
    poolPercentage: number;
  }>;
}

export default function PoolsPage() {
  const { user, token } = useAuth();
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPoolData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/pools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pool data');
      }

      const data = await response.json();
      setPoolData(data.data);
    } catch (error) {
      console.error('Error fetching pool data:', error);
      // Set default structure on error
      setPoolData({
        currentPool: {
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          totalDeposits: 0,
          pools: {
            silver: { total: 0, members: 0, perMember: 0 },
            gold: { total: 0, members: 0, perMember: 0 },
            diamond: { total: 0, members: 0, perMember: 0 },
            ruby: { total: 0, members: 0, perMember: 0 },
          },
        },
        userRank: 'Bronze',
        eligibility: {
          qualified: false,
          rank: 'Bronze',
          poolPercentage: 0,
          estimatedShare: 0,
        },
        history: [],
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPoolData();
  }, [fetchPoolData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="text-white">Loading pool data...</div>
        </div>
      </DashboardLayout>
    );
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Silver': return 'from-gray-600 to-gray-700';
      case 'Gold': return 'from-yellow-600 to-yellow-700';
      case 'Diamond': return 'from-blue-600 to-blue-700';
      case 'Ruby': return 'from-red-600 to-red-700';
      default: return 'from-gray-700 to-gray-800';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Diamond': return '💎';
      case 'Ruby': return '❤️';
      default: return '🏆';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">💎 Leadership Pools</h1>
            <p className="text-gray-400">Monthly rewards for qualified leaders</p>
          </motion.div>

          {/* User's Eligibility Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className={`bg-gradient-to-r ${
              poolData?.eligibility.qualified 
                ? 'from-green-900/50 to-green-800/50 border-green-500/30' 
                : 'from-yellow-900/50 to-yellow-800/50 border-yellow-500/30'
            } border rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Status</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  poolData?.eligibility.qualified
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {poolData?.eligibility.qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}
                </span>
              </div>

              {poolData?.eligibility.qualified ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Your Rank</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                      {getRankIcon(poolData.eligibility.rank)} {poolData.eligibility.rank}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Pool Share</div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {poolData.eligibility.poolPercentage}%
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Est. This Month</div>
                    <div className="text-2xl font-bold text-green-400 mt-1">
                      ${poolData.eligibility.estimatedShare.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-yellow-300">
                    🎯 You need to reach Silver rank or higher to qualify for leadership pools!
                  </p>
                  <div className="text-sm text-gray-300">
                    <strong>Requirements for Silver:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Total team volume: 50,000 USDT</li>
                      <li>Personal stake: 1,000 USDT minimum</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Current Month's Pools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {poolData?.currentPool.month} Pool Status
            </h2>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-gray-400 text-sm">Total Deposits This Month</div>
                <div className="text-4xl font-bold text-white mt-2">
                  ${poolData?.currentPool.totalDeposits.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['silver', 'gold', 'diamond', 'ruby'].map((rank) => {
                  const pool = poolData?.currentPool.pools[rank as keyof typeof poolData.currentPool.pools];
                  const rankCapitalized = rank.charAt(0).toUpperCase() + rank.slice(1);
                  
                  return (
                    <motion.div
                      key={rank}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gradient-to-br ${getRankColor(rankCapitalized)} rounded-xl p-6 text-center`}
                    >
                      <div className="text-3xl mb-2">{getRankIcon(rankCapitalized)}</div>
                      <h3 className="text-white font-bold text-lg mb-1">{rankCapitalized} Pool</h3>
                      <div className="text-gray-300 text-sm mb-3">
                        {rank === 'silver' ? '0.5%' : 
                         rank === 'gold' ? '1.0%' : 
                         rank === 'diamond' ? '1.5%' : '2.0%'} of deposits
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="bg-black/30 rounded-lg p-2">
                          <div className="text-gray-300">Total Pool</div>
                          <div className="text-white font-bold">${pool?.total.toFixed(2)}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2">
                          <div className="text-gray-300">Members</div>
                          <div className="text-white font-bold">{pool?.members}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2">
                          <div className="text-gray-300">Per Member</div>
                          <div className="text-green-400 font-bold">${pool?.perMember.toFixed(2)}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Distribution History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Distribution History</h2>
            
            {poolData?.history.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl p-8 text-center">
                <div className="text-gray-400">No distribution history yet</div>
                <div className="text-gray-500 text-sm mt-2">
                  Qualify for a leadership pool to start earning monthly distributions
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Pool %
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {poolData?.history.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center gap-2 text-sm text-white">
                              {getRankIcon(item.rank)} {item.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {item.poolPercentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                            ${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-4">📊 How Leadership Pools Work</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• A percentage of all deposits goes into monthly pools</li>
                <li>• Silver: 0.5%, Gold: 1.0%, Diamond: 1.5%, Ruby: 2.0%</li>
                <li>• Distributed equally among qualified members of each rank</li>
                <li>• Automatic distribution on the 1st of each month</li>
                <li>• Must maintain rank and minimum stake to qualify</li>
              </ul>
            </div>

            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">🎯 Rank Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><strong>Silver:</strong> 50K volume + 1K stake</li>
                <li><strong>Gold:</strong> 100K volume + 2.5K stake</li>
                <li><strong>Diamond:</strong> 250K volume + 5K stake</li>
                <li><strong>Ruby:</strong> 500K volume + 10K stake</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 