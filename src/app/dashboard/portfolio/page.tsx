"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Stake {
  id: string;
  amount: number;
  date: string;
  roiRate: number;
  totalROIEarned: number;
  daysActive: number;
  dailyROI: number;
  enhancedROI: boolean;
}

interface InvestData {
  stakes: Stake[];
  totalStaked: number;
  totalDailyROI: number;
  totalROIEarned: number;
  averageROIRate: number;
  enhancedROIStatus: {
    qualified: boolean;
    totalStakeRequired: number;
    currentTotalStake: number;
    referralsRequired: number;
    currentQualifiedReferrals: number;
  };
  compounding: {
    active: boolean;
    daysWithoutWithdrawal: number;
    thresholdDays: number;
    rate: number;
  };
  roiHistory: Array<{
    date: string;
    amount: number;
    stake: string;
  }>;
}

export default function InvestPage() {
  const { token } = useAuth();
  const [investData, setInvestData] = useState<InvestData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvestData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staking/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setInvestData(data.data);
    } catch (error) {
      console.error('Error fetching invest data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvestData();
  }, [fetchInvestData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-white">Loading investment data...</div>
        </div>
      </DashboardLayout>
    );
  }

  const calculateProjectedEarnings = (timeframe: 'week' | 'month' | 'year') => {
    const dailyROI = investData?.totalDailyROI || 0;
    const multiplier = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
    return dailyROI * multiplier;
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Investment Portfolio</h1>
            <p className="text-gray-400">Track your stakes performance and ROI analytics</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-blue-500/30 rounded-xl p-6">
              <div className="text-blue-400 text-sm font-semibold mb-2">Total Staked</div>
              <div className="text-2xl font-bold text-white">
                ${investData?.totalStaked?.toLocaleString() || '0.00'} USDT
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {investData?.stakes?.length || 0} active stakes
              </div>
            </div>

            <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-sm font-semibold mb-2">Daily ROI</div>
              <div className="text-2xl font-bold text-white">
                ${investData?.totalDailyROI?.toFixed(2) || '0.00'} USDT
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {investData?.averageROIRate?.toFixed(2) || '0.75'}% average rate
              </div>
            </div>

            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6">
              <div className="text-purple-400 text-sm font-semibold mb-2">Total ROI Earned</div>
              <div className="text-2xl font-bold text-white">
                ${investData?.totalROIEarned?.toLocaleString() || '0.00'} USDT
              </div>
              <div className="text-gray-400 text-xs mt-1">
                All-time earnings
              </div>
            </div>

            <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl p-6">
              <div className="text-orange-400 text-sm font-semibold mb-2">Enhanced ROI</div>
              <div className="text-2xl font-bold text-white">
                {investData?.enhancedROIStatus?.qualified ? 'Active' : 'Inactive'}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {investData?.enhancedROIStatus?.qualified ? '0.85% rate' : '0.75% base rate'}
              </div>
            </div>
          </div>

          {/* ROI Projections */}
          <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">ROI Projections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-cyan-400 text-sm font-semibold mb-2">Weekly Projection</div>
                <div className="text-xl font-bold text-white">
                  ${calculateProjectedEarnings('week').toFixed(2)} USDT
                </div>
                <div className="text-gray-400 text-xs">
                  Based on current daily ROI
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-cyan-400 text-sm font-semibold mb-2">Monthly Projection</div>
                <div className="text-xl font-bold text-white">
                  ${calculateProjectedEarnings('month').toFixed(2)} USDT
                </div>
                <div className="text-gray-400 text-xs">
                  30-day earning potential
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-cyan-400 text-sm font-semibold mb-2">Yearly Projection</div>
                <div className="text-xl font-bold text-white">
                  ${calculateProjectedEarnings('year').toFixed(2)} USDT
                </div>
                <div className="text-gray-400 text-xs">
                  Annual earning potential
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced ROI Qualification */}
          {!investData?.enhancedROIStatus?.qualified && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">🚀 Unlock Enhanced ROI (0.85%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-yellow-200 text-sm font-semibold mb-2">Stake Requirement</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      ${investData?.enhancedROIStatus?.currentTotalStake?.toLocaleString() || '0'} / 
                      ${investData?.enhancedROIStatus?.totalStakeRequired?.toLocaleString() || '5,000'} USDT
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (investData?.enhancedROIStatus?.currentTotalStake || 0) >= (investData?.enhancedROIStatus?.totalStakeRequired || 5000)
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {(investData?.enhancedROIStatus?.currentTotalStake || 0) >= (investData?.enhancedROIStatus?.totalStakeRequired || 5000) ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((investData?.enhancedROIStatus?.currentTotalStake || 0) / (investData?.enhancedROIStatus?.totalStakeRequired || 5000)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-yellow-200 text-sm font-semibold mb-2">Referral Requirement</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {investData?.enhancedROIStatus?.currentQualifiedReferrals || 0} / 
                      {investData?.enhancedROIStatus?.referralsRequired || 1} qualified referrals
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (investData?.enhancedROIStatus?.currentQualifiedReferrals || 0) >= (investData?.enhancedROIStatus?.referralsRequired || 1)
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {(investData?.enhancedROIStatus?.currentQualifiedReferrals || 0) >= (investData?.enhancedROIStatus?.referralsRequired || 1) ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Each referral needs ≥1,000 USDT stake
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compounding Status */}
          <div className="bg-gray-900/50 border border-indigo-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Compounding Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-400 text-sm font-semibold">Compounding</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    investData?.compounding?.active 
                      ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                      : 'bg-gray-900/50 border border-gray-500/50 text-gray-400'
                  }`}>
                    {investData?.compounding?.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="text-white text-lg font-bold">
                  {investData?.compounding?.active ? `${investData.compounding.rate}% Daily` : '0.75% Base Rate'}
                </div>
                <div className="text-gray-400 text-xs">
                  {investData?.compounding?.active 
                    ? 'Income wallet compounding active'
                    : 'Activate by not withdrawing for 7 days'
                  }
                </div>
              </div>
              <div>
                <div className="text-indigo-400 text-sm font-semibold mb-2">Days Without Withdrawal</div>
                <div className="flex items-center justify-between">
                  <span className="text-white">
                    {investData?.compounding?.daysWithoutWithdrawal || 0} / {investData?.compounding?.thresholdDays || 7} days
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((investData?.compounding?.daysWithoutWithdrawal || 0) / (investData?.compounding?.thresholdDays || 7)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {(investData?.compounding?.thresholdDays || 7) - (investData?.compounding?.daysWithoutWithdrawal || 0)} days remaining to activate
                </div>
              </div>
            </div>
          </div>

          {/* Active Stakes */}
          <div className="bg-gray-900/50 border border-gray-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Active Stakes</h3>
            <div className="space-y-4">
              {investData?.stakes?.length ? (
                investData.stakes.map((stake) => (
                  <div key={stake.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">💰</div>
                        <div>
                          <div className="text-white font-semibold">
                            ${stake.amount.toLocaleString()} USDT
                          </div>
                          <div className="text-gray-400 text-sm">
                            Staked on {new Date(stake.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          ${stake.dailyROI.toFixed(2)}/day
                        </div>
                        <div className="text-gray-400 text-sm">
                          {stake.roiRate}% {stake.enhancedROI ? '(Enhanced)' : '(Base)'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-xs">Days Active</div>
                        <div className="text-white font-semibold">{stake.daysActive}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Total ROI Earned</div>
                        <div className="text-green-400 font-semibold">${stake.totalROIEarned.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No active stakes</div>
                  <div className="text-gray-500 text-sm mb-4">
                    Make a deposit to start earning daily returns
                  </div>
                  <button 
                    onClick={() => window.location.href = '/dashboard/wallet'}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    💰 Make Your First Investment
                  </button>
                </div>
              )}
            </div>
            
            {/* Add Investment Button for users with existing stakes */}
            {investData?.stakes?.length > 0 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => window.location.href = '/dashboard/wallet'}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  💰 Add More Investment
                </button>
                <p className="text-gray-400 text-sm mt-2">
                  Minimum deposit: 500 USDT
                </p>
              </div>
            )}
          </div>

          {/* Recent ROI History */}
          <div className="bg-gray-900/50 border border-gray-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent ROI Payments</h3>
            <div className="space-y-3">
              {investData?.roiHistory?.slice(0, 10).map((roi, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <div className="text-white font-semibold">Daily ROI Payment</div>
                      <div className="text-gray-400 text-sm">{new Date(roi.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+${roi.amount.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">Stake: ${roi.stake}</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <div className="text-gray-400">No ROI history yet</div>
                  <div className="text-gray-500 text-sm">ROI payments will appear here daily</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}