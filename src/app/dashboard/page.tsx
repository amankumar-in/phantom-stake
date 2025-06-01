"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
    availableForWithdrawal: number;
    principalLocked: boolean;
    lockExpiry: string;
    currentROIRate: number;
  };
  wallets: {
    principal: {
      balance: number;
      locked: boolean;
      lockExpiry: string;
      totalDeposited: number;
      canWithdraw: boolean;
    };
    income: {
      balance: number;
      totalEarned: number;
      totalWithdrawn: number;
      canWithdraw: boolean;
      compoundingActive: boolean;
      compoundingRate: number;
    };
  };
  team: {
    rank: string;
    pairs: number;
    leftTeamVolume: number;
    rightTeamVolume: number;
    totalTeamVolume: number;
    thirtyDayVolume: number;
    rankBonus: number;
    nextMilestone: {
      progress: number;
      nextReward: string;
      remaining: number;
      nextRank: string;
      pairs: number;
    };
    matchingBonus: {
      totalEarned: number;
      todayEarned: number;
      dailyLimit: number;
      remaining: number;
    };
  };
  program: {
    current: string;
    status: string;
    launchDate: string;
    endDate: string;
    daysRemaining: number;
    enhancedROI: {
      qualified: boolean;
      rate: number;
      qualificationDate: string;
    };
  };
  referrals: {
    totalReferrals: number;
    totalReferralEarnings: number;
    directReferrals: number;
  };
  mlmEarnings: {
    levelOverrides: number;
    leadershipPools: number;
    milestoneRewards: number;
    matchingBonus: number;
  };
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-purple-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const calculateDaysUntilUnlock = () => {
    if (!dashboardData.wallets.principal.locked) return 0;
    
    // Handle null or invalid lockExpiry dates
    if (!dashboardData.wallets.principal.lockExpiry) return 0;
    
    const lockExpiry = new Date(dashboardData.wallets.principal.lockExpiry);
    const now = new Date();
    
    // Check if lockExpiry is a valid date
    if (isNaN(lockExpiry.getTime())) return 0;
    
    // If lock has already expired, return 0
    if (lockExpiry <= now) return 0;
    
    const diffTime = lockExpiry.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Safety check - if days is unreasonably large, return 0
    if (days > 365) return 0;
    
    return days;
  };

  const daysUntilUnlock = calculateDaysUntilUnlock();

  return (
    <DashboardLayout>
      <div className="relative p-8">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <motion.header 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <TextAnimate 
                  animation="blurInUp"
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2"
                >
                  {`Welcome back, ${dashboardData.user.firstName}!`}
                </TextAnimate>
                <p className="text-gray-400 text-lg">
                  Program I Founder • Rank: {dashboardData.team.rank} • {dashboardData.program.daysRemaining} days remaining
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                <PulsatingButton 
                  pulseColor="#10b981"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-purple-600 text-white font-semibold"
                  onClick={() => router.push("/dashboard/wallet")}
                >
                  💰 Make Deposit
                </PulsatingButton>
                
                <ShimmerButton
                  shimmerColor="#a855f7"
                  background="rgba(139, 69, 219, 0.1)"
                  className="px-4 py-2 border-purple-400 text-purple-400 font-semibold hover:text-white"
                  onClick={() => router.push("/dashboard/wallet")}
                >
                  💼 Manage Wallet
                </ShimmerButton>

                {/* Temporary Reset Button */}
                <button
                  onClick={async () => {
                    if (confirm('This will reset all your data to clean zeros. Continue?')) {
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/reset`, {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        });
                        if (response.ok) {
                          alert('Data reset successfully!');
                          fetchDashboardData();
                        } else {
                          alert('Reset failed');
                        }
                      } catch (error) {
                        alert('Reset error');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                >
                  🗑️ Reset Fake Data
                </button>

                {/* Process ROI Button (Temporary for Testing) */}
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/process-roi`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      if (response.ok) {
                        alert(`ROI processed! ${data.data.totalProcessed} stakes processed, total: $${data.data.totalAmount.toFixed(2)}`);
                        fetchDashboardData();
                      } else {
                        alert('ROI processing failed: ' + data.message);
                      }
                    } catch (error) {
                      alert('ROI processing error');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                >
                  💰 Process Daily ROI
                </button>
              </div>
            </div>

            {/* Program Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-r from-green-900/40 to-purple-900/40 border border-green-500/40 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.span 
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-green-400 font-semibold text-lg">Program I: Founders Edition - ACTIVE</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{dashboardData.program.daysRemaining} Days Left</div>
                  <div className="text-green-300 text-sm">Ends Sep 30, 2026</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Your ROI Rate</div>
                  <div className="text-xl font-bold text-green-300">
                    {(dashboardData.financial.currentROIRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Enhanced ROI</div>
                  <div className="text-xl font-bold text-blue-300">
                    {dashboardData.program.enhancedROI.qualified ? "QUALIFIED" : "NOT QUALIFIED"}
                  </div>
                  <div className="text-xs text-gray-400">≥$5K + ≥1 Ref ≥$1K</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Program Status</div>
                  <div className="text-xl font-bold text-purple-300">{dashboardData.program.status}</div>
                  <div className="text-xs text-gray-400">Since Aug 1, 2025</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Grace Period</div>
                  <div className="text-xl font-bold text-yellow-300">15 Days</div>
                  <div className="text-xs text-gray-400">After program ends</div>
                </div>
              </div>
            </motion.div>
          </motion.header>

          {/* Two-Wallet System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">💼 Your Phantom Stake Wallets</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Principal Wallet */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Principal Wallet</h3>
                      <p className="text-blue-300 text-sm">Your Original Investment</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    dashboardData.wallets.principal.balance === 0
                      ? "bg-gray-900/50 border border-gray-500/50 text-gray-400" 
                      : dashboardData.wallets.principal.locked 
                      ? "bg-red-900/50 border border-red-500/50 text-red-300" 
                      : "bg-green-900/50 border border-green-500/50 text-green-300"
                  }`}>
                    {dashboardData.wallets.principal.balance === 0 
                      ? "NO INVESTMENT" 
                      : dashboardData.wallets.principal.locked 
                      ? `LOCKED (${daysUntilUnlock} days)` 
                      : "UNLOCKED"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-800/20 rounded-xl p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        $<NumberTicker value={dashboardData.wallets.principal.balance} />
                      </div>
                      <div className="text-blue-300 text-sm">Current Principal Balance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Total Deposited</div>
                      <div className="text-lg font-bold text-white">
                        $<NumberTicker value={dashboardData.wallets.principal.totalDeposited} />
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Lock Status</div>
                      <div className="text-lg font-bold text-white">
                        {dashboardData.wallets.principal.locked ? "6 Month Lock" : "Unlocked"}
                      </div>
                    </div>
                  </div>

                  {dashboardData.wallets.principal.locked && dashboardData.wallets.principal.balance > 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                      <div className="text-yellow-300 text-sm font-semibold">
                        🔒 Principal is locked for {daysUntilUnlock} more days for security
                      </div>
                      <div className="text-yellow-200 text-xs mt-1">
                        Unlocks: {new Date(dashboardData.wallets.principal.lockExpiry).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <button 
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      dashboardData.wallets.principal.canWithdraw 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!dashboardData.wallets.principal.canWithdraw}
                    onClick={() => router.push("/dashboard/wallet")}
                  >
                    {dashboardData.wallets.principal.canWithdraw ? "Withdraw Principal" : "Principal Locked"}
                  </button>
                </div>
              </div>

              {/* Income Wallet */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Income Wallet</h3>
                      <p className="text-green-300 text-sm">Your Daily Earnings</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-900/50 border border-green-500/50 rounded-full text-xs font-semibold text-green-300">
                    WITHDRAWABLE ANYTIME
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-800/20 rounded-xl p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        $<NumberTicker value={dashboardData.wallets.income.balance} />
                      </div>
                      <div className="text-green-300 text-sm">Available to Withdraw</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Total Earned</div>
                      <div className="text-lg font-bold text-white">
                        $<NumberTicker value={dashboardData.wallets.income.totalEarned} />
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Total Withdrawn</div>
                      <div className="text-lg font-bold text-white">
                        $<NumberTicker value={dashboardData.wallets.income.totalWithdrawn} />
                      </div>
                    </div>
                  </div>

                  {dashboardData.wallets.income.compoundingActive ? (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                      <div className="text-purple-300 text-sm font-semibold">
                        🚀 COMPOUNDING ACTIVE: {(dashboardData.wallets.income.compoundingRate * 100).toFixed(1)}% daily
                      </div>
                      <div className="text-purple-200 text-xs mt-1">
                        Your income is growing faster! Don't withdraw to keep compounding.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-blue-300 text-sm font-semibold">
                        💡 TIP: Don't withdraw for 7 days to activate 1.0% daily compounding
                      </div>
                    </div>
                  )}

                  <button 
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      dashboardData.wallets.income.canWithdraw 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!dashboardData.wallets.income.canWithdraw}
                    onClick={() => router.push("/dashboard/wallet")}
                  >
                    {dashboardData.wallets.income.canWithdraw ? "Withdraw Income" : "Minimum $1,000 to Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">📊 Financial Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-900/40 to-green-800/40 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">💵</div>
                <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
                <div className="text-2xl font-bold text-white">
                  $<NumberTicker value={dashboardData.financial.totalBalance} />
                </div>
                <div className="text-green-300 text-sm">
                  Principal + Income
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-sm text-gray-400 mb-1">Daily Earnings</div>
                <div className="text-2xl font-bold text-white">
                  $<NumberTicker value={dashboardData.financial.dailyEarnings} />
                </div>
                <div className="text-blue-300 text-sm">
                  {(dashboardData.financial.currentROIRate * 100).toFixed(2)}% ROI
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-sm text-gray-400 mb-1">Monthly Projection</div>
                <div className="text-2xl font-bold text-white">
                  $<NumberTicker value={dashboardData.financial.monthlyEarnings} />
                </div>
                <div className="text-purple-300 text-sm">
                  30-day estimate
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
                <div className="text-2xl font-bold text-white">
                  $<NumberTicker value={dashboardData.financial.totalEarnings} />
                </div>
                <div className="text-yellow-300 text-sm">
                  All-time income
                </div>
              </div>
            </div>
          </motion.div>

          {/* MLM Performance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Your Team Performance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rank & Progress */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Current Rank</h3>
                  <div className="text-4xl font-bold text-purple-300 mb-2">{dashboardData.team.rank}</div>
                  <div className="text-sm text-gray-400">
                    {dashboardData.team.pairs} Team Balance Points
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-800/20 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">Next Achievement Progress</div>
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${dashboardData.team.nextMilestone.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">
                        {dashboardData.team.nextMilestone.remaining} points to go
                      </span>
                      <span className="text-purple-300">
                        {dashboardData.team.nextMilestone.progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                    <div className="text-yellow-300 text-sm font-semibold">
                      🎁 Next Reward: {dashboardData.team.nextMilestone.nextReward}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Volume */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Team Growth</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-800/20 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-400">Left Team</div>
                      <div className="text-lg font-bold text-blue-300">
                        $<NumberTicker value={dashboardData.team.leftTeamVolume} />
                      </div>
                    </div>
                    <div className="bg-green-800/20 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-400">Right Team</div>
                      <div className="text-lg font-bold text-green-300">
                        $<NumberTicker value={dashboardData.team.rightTeamVolume} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-800/20 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400">Monthly Activity</div>
                    <div className="text-xl font-bold text-white">
                      $<NumberTicker value={dashboardData.team.thirtyDayVolume} />
                    </div>
                  </div>

                  <div className="bg-yellow-800/20 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400">Your Rank Bonus</div>
                    <div className="text-xl font-bold text-yellow-300">
                      $<NumberTicker value={dashboardData.team.rankBonus} />
                    </div>
                  </div>
                </div>
              </div>

              {/* MLM Earnings Breakdown */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Team Earnings</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 text-sm">Friend Invites (10%)</span>
                    <span className="text-green-300 font-semibold">
                      $<NumberTicker value={dashboardData.referrals.totalReferralEarnings} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 text-sm">Team Balance Bonus</span>
                    <span className="text-blue-300 font-semibold">
                      $<NumberTicker value={dashboardData.mlmEarnings.matchingBonus} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 text-sm">Deep Network Earnings</span>
                    <span className="text-purple-300 font-semibold">
                      $<NumberTicker value={dashboardData.mlmEarnings.levelOverrides} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 text-sm">Rank Bonuses</span>
                    <span className="text-yellow-300 font-semibold">
                      $<NumberTicker value={dashboardData.mlmEarnings.leadershipPools} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 text-sm">Achievement Rewards</span>
                    <span className="text-orange-300 font-semibold">
                      $<NumberTicker value={dashboardData.mlmEarnings.milestoneRewards} />
                    </span>
                  </div>

                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between items-center py-2 px-3 bg-green-800/20 rounded-lg">
                      <span className="text-white font-semibold">Total Team Earnings</span>
                      <span className="text-green-300 font-bold text-lg">
                        $<NumberTicker value={
                          dashboardData.referrals.totalReferralEarnings +
                          dashboardData.mlmEarnings.matchingBonus +
                          dashboardData.mlmEarnings.levelOverrides +
                          dashboardData.mlmEarnings.leadershipPools +
                          dashboardData.mlmEarnings.milestoneRewards
                        } />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">⚡ Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/wallet")}
                className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6 text-center hover:bg-green-600/30 transition-colors"
              >
                <div className="text-3xl mb-2">💰</div>
                <div className="text-green-400 font-semibold mb-1">Make Investment</div>
                <div className="text-gray-400 text-sm">Add to principal wallet</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/portfolio")}
                className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-6 text-center hover:bg-blue-600/30 transition-colors"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="text-blue-400 font-semibold mb-1">View Portfolio</div>
                <div className="text-gray-400 text-sm">Track your investments</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/referrals")}
                className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6 text-center hover:bg-purple-600/30 transition-colors"
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="text-purple-400 font-semibold mb-1">Share & Earn</div>
                <div className="text-gray-400 text-sm">Invite friends</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/teams")}
                className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center hover:bg-yellow-600/30 transition-colors"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-yellow-400 font-semibold mb-1">View Team</div>
                <div className="text-gray-400 text-sm">Binary tree</div>
              </motion.button>
            </div>
          </motion.div>

          {/* Important Notices */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white mb-6">📢 Important Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* How the Two-Wallet System Works */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-300 mb-4">💡 How Your Wallets Work</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-400">🏦</span>
                    <div>
                      <strong className="text-white">Principal Wallet:</strong> Your original investment ($
                      {dashboardData.wallets.principal.balance.toLocaleString()}) is safely stored here and locked for 6 months to prevent panic selling. This preserves your capital.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400">💰</span>
                    <div>
                      <strong className="text-white">Income Wallet:</strong> Your daily {(dashboardData.financial.currentROIRate * 100).toFixed(2)}% ROI (${dashboardData.financial.dailyEarnings.toFixed(2)}/day) goes here. You can withdraw this anytime after reaching $1,000 minimum.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-400">🚀</span>
                    <div>
                      <strong className="text-white">Compounding:</strong> If you don't withdraw from your Income Wallet for 7 days, it starts earning 1.0% daily instead of 0.75%!
                    </div>
                  </div>
                </div>
              </div>

              {/* Program I Key Information */}
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-300 mb-4">📈 Program I Key Facts</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Base ROI Rate:</span>
                    <span className="text-white font-semibold">0.75% daily</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enhanced ROI (if qualified):</span>
                    <span className="text-white font-semibold">0.85% daily</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compounding Rate:</span>
                    <span className="text-white font-semibold">1.0% daily</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Investment:</span>
                    <span className="text-white font-semibold">$500 USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Withdrawal:</span>
                    <span className="text-white font-semibold">$1,000 USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal Fee:</span>
                    <span className="text-white font-semibold">5% + Gas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Program Ends:</span>
                    <span className="text-white font-semibold">Sep 30, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 