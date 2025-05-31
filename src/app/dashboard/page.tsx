"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    referralCode: string;
    rank: string;
  };
  financial: {
    totalInvestment: number;
    totalBalance: number;
    principalWalletBalance: number;
    incomeWalletBalance: number;
    dailyEarnings: number;
    monthlyEarnings: number;
    totalEarnings: number;
  };
  investments: {
    active: number;
    total: number;
    details: Array<{
      id: string;
      amount: number;
      program: string;
      startDate: string;
      principalBalance: number;
      incomeBalance: number;
      dailyROI: number;
      lockedUntil: string;
      status: string;
    }>;
  };
  referrals: {
    totalReferrals: number;
    totalReferralEarnings: number;
    recentReferrals: Array<{
      user: { username: string; firstName: string; lastName: string };
      dateReferred: string;
      commission: number;
    }>;
  };
  team: {
    rank: string;
    pairs: number;
    leftTeamVolume: number;
    rightTeamVolume: number;
    totalTeamVolume: number;
    rankBonus: number;
    nextMilestone?: {
      pairs: number;
      reward: string;
      progress: number;
      remaining: number;
    };
  };
  program: {
    current: string;
    status: string;
    launchDate: string;
    endDate: string;
    daysRemaining: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100/api'}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboardData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white text-lg mb-4">{error || 'Failed to load dashboard'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <TextAnimate 
                animation="blurInUp"
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2"
              >
                {`Welcome back, ${dashboardData.user.firstName}! 👋`}
              </TextAnimate>
              <p className="text-gray-400 text-lg">
                Track your investments and earnings in real-time
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-400 text-sm">Your Rank</p>
                <p className="text-xl font-bold text-purple-400">{dashboardData.team.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Referral Code</p>
                <p className="text-lg font-mono text-green-400">{dashboardData.user.referralCode}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 font-semibold">Total Balance</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${dashboardData.financial.totalBalance.toLocaleString()}
            </p>
            <p className="text-green-400 text-sm">
              Principal + Income
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-300 font-semibold">Daily Earnings</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${dashboardData.financial.dailyEarnings.toFixed(2)}
            </p>
            <p className="text-blue-400 text-sm">
              0.75% ROI
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300 font-semibold">Income Wallet</h3>
              <span className="text-2xl">🏦</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${dashboardData.financial.incomeWalletBalance.toLocaleString()}
            </p>
            <p className="text-purple-400 text-sm">
              Withdrawable
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-300 font-semibold">Referral Earnings</h3>
              <span className="text-2xl">🤝</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${dashboardData.referrals.totalReferralEarnings.toLocaleString()}
            </p>
            <p className="text-yellow-400 text-sm">
              {dashboardData.referrals.totalReferrals} Referrals
            </p>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Investments */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Active Investments */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Active Investments</h3>
                <PulsatingButton 
                  pulseColor="#10b981"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm"
                >
                  + New Investment
                </PulsatingButton>
              </div>

              {dashboardData.investments.details.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.investments.details.map((investment, index) => (
                    <div key={investment.id} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{investment.program}</h4>
                          <p className="text-gray-400 text-sm">
                            Started: {new Date(investment.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${investment.amount.toLocaleString()}
                          </p>
                          <p className="text-green-400 text-sm">
                            {investment.dailyROI}% Daily
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Principal Balance</p>
                          <p className="text-white font-semibold">
                            ${investment.principalBalance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Income Balance</p>
                          <p className="text-green-400 font-semibold">
                            ${investment.incomeBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <p className="text-gray-400 text-xs">
                          Principal locked until: {new Date(investment.lockedUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400 mb-4">No active investments yet</p>
                  <PulsatingButton 
                    pulseColor="#10b981"
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white"
                  >
                    Make Your First Investment
                  </PulsatingButton>
                </div>
              )}
            </div>

            {/* Recent Referrals */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Referrals</h3>
              
              {dashboardData.referrals.recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.referrals.recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
                      <div>
                        <p className="text-white font-semibold">
                          {referral.user.firstName} {referral.user.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          @{referral.user.username}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">
                          +${referral.commission.toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(referral.dateReferred).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-400">No referrals yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Quick Actions & Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Quick Actions */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/wallet">
                  <PulsatingButton 
                    pulseColor="#10b981"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3"
                  >
                    🏦 Manage Wallets
                  </PulsatingButton>
                </Link>
                
                <PulsatingButton 
                  pulseColor="#3b82f6"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3"
                >
                  💰 Make Investment
                </PulsatingButton>
                
                <ShimmerButton
                  shimmerColor="#a855f7"
                  background="rgba(139, 69, 219, 0.1)"
                  borderRadius="8px"
                  className="w-full text-purple-400 border-purple-500/30 py-3"
                >
                  💸 Withdraw Income
                </ShimmerButton>
                
                <ShimmerButton
                  shimmerColor="#3b82f6"
                  background="rgba(59, 130, 246, 0.1)"
                  borderRadius="8px"
                  className="w-full text-blue-400 border-blue-500/30 py-3"
                >
                  📊 View Calculator
                </ShimmerButton>
              </div>
            </div>

            {/* Team Progress */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Team Progress</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Current Pairs</p>
                  <p className="text-2xl font-bold text-purple-400">{dashboardData.team.pairs}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Left Team</p>
                    <p className="text-blue-400 font-semibold">
                      ${dashboardData.team.leftTeamVolume.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Right Team</p>
                    <p className="text-green-400 font-semibold">
                      ${dashboardData.team.rightTeamVolume.toLocaleString()}
                    </p>
                  </div>
                </div>

                {dashboardData.team.nextMilestone && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Next Milestone</span>
                      <span>{dashboardData.team.nextMilestone.pairs} pairs</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                        style={{ width: `${dashboardData.team.nextMilestone.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-yellow-400 text-xs text-center">
                      {dashboardData.team.nextMilestone.reward}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Program Info */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Program Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Program</span>
                  <span className="text-purple-400 font-semibold">
                    {dashboardData.program.current}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-semibold">
                    {dashboardData.program.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Remaining</span>
                  <span className="text-yellow-400 font-semibold">
                    {dashboardData.program.daysRemaining}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}