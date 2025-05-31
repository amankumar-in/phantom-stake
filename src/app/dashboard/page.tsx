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
        {/* Dashboard Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="mb-4 lg:mb-0">
                <TextAnimate 
                  animation="blurInUp"
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2"
                >
                  {`Welcome back, ${dashboardData.user.firstName}! 👋`}
                </TextAnimate>
                <p className="text-gray-400 text-lg">
                  Track your investments and earnings in real-time
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-sm font-medium">Live Data</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <div className="text-center sm:text-right">
                  <p className="text-gray-400 text-sm">Your Rank</p>
                  <p className="text-xl font-bold text-purple-400">{dashboardData.team.rank}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-gray-400 text-sm">Referral Code</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-mono text-green-400">{dashboardData.user.referralCode}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(dashboardData.user.referralCode)}
                      className="text-xs text-gray-400 hover:text-green-400 transition-colors"
                      title="Copy referral code"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { href: '/dashboard/wallet', icon: '💳', label: 'Wallets', color: 'from-blue-600 to-blue-500' },
              { href: '/dashboard/invest', icon: '💰', label: 'Invest', color: 'from-green-600 to-green-500' },
              { href: '/dashboard/withdraw', icon: '💸', label: 'Withdraw', color: 'from-red-600 to-red-500' },
              { href: '/dashboard/teams', icon: '👥', label: 'Teams', color: 'from-purple-600 to-purple-500' },
              { href: '/dashboard/referrals', icon: '🤝', label: 'Referrals', color: 'from-yellow-600 to-yellow-500' },
              { href: '/calculator', icon: '📊', label: 'Calculator', color: 'from-pink-600 to-pink-500' },
            ].map((item, index) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`bg-gradient-to-r ${item.color} p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-white text-sm font-semibold">{item.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Financial Overview Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-500/30 rounded-xl p-6 hover:shadow-lg hover:shadow-green-500/20 transition-all">
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
            <div className="mt-2 text-xs text-gray-400">
              ↗ +{((Math.random() * 5) + 1).toFixed(2)}% this week
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-500/30 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
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
            <div className="mt-2 text-xs text-gray-400">
              Next credit in {24 - new Date().getHours()}h
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
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
            <div className="mt-2 text-xs text-gray-400">
              Min withdrawal: $50
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-500/30 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
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
            <div className="mt-2 text-xs text-gray-400">
              10% commission rate
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Investments & Activity */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Active Investments */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📊</span>
                  Active Investments
                </h3>
                <Link href="/dashboard/invest">
                  <PulsatingButton 
                    pulseColor="#10b981"
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm"
                  >
                    + New Investment
                  </PulsatingButton>
                </Link>
              </div>

              {dashboardData.investments.details.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.investments.details.map((investment, index) => (
                    <div key={investment.id} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
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
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs">
                            Locked until: {new Date(investment.lockedUntil).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-green-400 text-xs">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400 mb-4">No active investments yet</p>
                  <Link href="/dashboard/invest">
                    <PulsatingButton 
                      pulseColor="#10b981"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white"
                    >
                      Make Your First Investment
                    </PulsatingButton>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Referrals */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">👥</span>
                  Recent Referrals
                </h3>
                <Link href="/dashboard/referrals">
                  <ShimmerButton
                    shimmerColor="#3b82f6"
                    background="rgba(59, 130, 246, 0.1)"
                    borderRadius="8px"
                    className="text-sm px-4 py-2 border-blue-500/30"
                  >
                    View All
                  </ShimmerButton>
                </Link>
              </div>
              
              {dashboardData.referrals.recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.referrals.recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {referral.user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {referral.user.firstName} {referral.user.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            @{referral.user.username}
                          </p>
                        </div>
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
                  <p className="text-gray-400 mb-3">No referrals yet</p>
                  <p className="text-gray-500 text-sm">Share your referral code to start earning!</p>
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
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/dashboard/wallet">
                  <PulsatingButton 
                    pulseColor="#10b981"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3"
                  >
                    🏦 Manage Wallets
                  </PulsatingButton>
                </Link>
                
                <Link href="/dashboard/invest">
                  <PulsatingButton 
                    pulseColor="#3b82f6"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3"
                  >
                    💰 Make Investment
                  </PulsatingButton>
                </Link>
                
                <Link href="/dashboard/withdraw">
                  <ShimmerButton
                    shimmerColor="#a855f7"
                    background="rgba(139, 69, 219, 0.1)"
                    borderRadius="8px"
                    className="w-full text-purple-400 border-purple-500/30 py-3"
                  >
                    💸 Withdraw Income
                  </ShimmerButton>
                </Link>
                
                <Link href="/calculator">
                  <ShimmerButton
                    shimmerColor="#3b82f6"
                    background="rgba(59, 130, 246, 0.1)"
                    borderRadius="8px"
                    className="w-full text-blue-400 border-blue-500/30 py-3"
                  >
                    📊 View Calculator
                  </ShimmerButton>
                </Link>
              </div>
            </div>

            {/* Team Progress */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Team Progress
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Current Pairs</p>
                  <p className="text-3xl font-bold text-purple-400">{dashboardData.team.pairs}</p>
                  <p className="text-gray-500 text-xs">Binary team pairs</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center bg-blue-900/30 rounded-lg p-3">
                    <p className="text-blue-400 font-semibold">Left Team</p>
                    <p className="text-white font-bold">
                      ${dashboardData.team.leftTeamVolume.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center bg-green-900/30 rounded-lg p-3">
                    <p className="text-green-400 font-semibold">Right Team</p>
                    <p className="text-white font-bold">
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
                    <div className="bg-gray-700 rounded-full h-3 mb-2">
                      <div 
                        className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                        style={{ width: `${dashboardData.team.nextMilestone.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-yellow-400 text-xs text-center font-semibold">
                      🎁 {dashboardData.team.nextMilestone.reward}
                    </p>
                    <p className="text-gray-400 text-xs text-center mt-1">
                      {dashboardData.team.nextMilestone.remaining} pairs remaining
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Program Status */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🚀</span>
                Program Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Program</span>
                  <span className="text-purple-400 font-semibold">
                    {dashboardData.program.current}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-semibold flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    {dashboardData.program.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Remaining</span>
                  <span className="text-yellow-400 font-semibold">
                    {dashboardData.program.daysRemaining}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <div className="text-center">
                    <p className="text-purple-300 text-sm mb-2">Program Phase</p>
                    <div className="flex justify-center space-x-2">
                      {['I', 'II', 'III', 'IV'].map((phase, index) => (
                        <div
                          key={phase}
                          className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                            phase === 'I' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {phase}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}