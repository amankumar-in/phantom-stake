"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "@/contexts/AuthContext";

interface WalletData {
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
  summary: {
    totalBalance: number;
    availableBalance: number;
    lockedBalance: number;
    dailyEarnings: number;
  };
}

interface Transaction {
  type: string;
  amount: number;
  walletType: string;
  description: string;
  date: string;
  status: string;
}

interface WalletStats {
  walletOverview: {
    totalBalance: number;
    principalBalance: number;
    incomeBalance: number;
    lockedAmount: number;
    availableForWithdrawal: number;
  };
  lifetimeStats: {
    totalDeposited: number;
    totalEarned: number;
    totalWithdrawn: number;
    netProfit: number;
  };
  projections: {
    dailyROI: number;
    weeklyROI: number;
    monthlyROI: number;
    currentROIRate: number;
  };
  lockStatus: {
    principalLocked: boolean;
    lockExpiry: string;
    daysUntilUnlock: number;
  };
}

export default function WalletPage() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'testing'>('overview');

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100/api';

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const [overviewRes, statsRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/wallet/overview`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/wallet/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/wallet/transactions?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!overviewRes.ok || !statsRes.ok || !transactionsRes.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const [overviewData, statsData, transactionsData] = await Promise.all([
        overviewRes.json(),
        statsRes.json(),
        transactionsRes.json(),
      ]);

      setWalletData(overviewData.data);
      setWalletStats(statsData.data);
      setTransactions(transactionsData.data.transactions);
    } catch (error) {
      console.error('Wallet fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  // Handle dummy deposit
  const handleDummyDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 50) {
      setError('Minimum deposit amount is $50');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet/dummy-deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          description: `Test deposit of $${depositAmount}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Deposit failed');
      }

      setDepositAmount('');
      await fetchWalletData(); // Refresh data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Deposit failed');
    } finally {
      setProcessing(false);
    }
  };

  // Handle dummy income
  const handleDummyIncome = async () => {
    if (!incomeAmount || parseFloat(incomeAmount) < 1) {
      setError('Minimum income amount is $1');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet/dummy-income`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(incomeAmount),
          description: `Test income credit of $${incomeAmount}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Income credit failed');
      }

      setIncomeAmount('');
      await fetchWalletData(); // Refresh data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Income credit failed');
    } finally {
      setProcessing(false);
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 50) {
      setError('Minimum withdrawal amount is $50');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet/withdraw-income`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          description: 'Manual withdrawal from wallet page',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Withdrawal failed');
      }

      setWithdrawAmount('');
      await fetchWalletData(); // Refresh data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'roi_credit': return '📈';
      case 'referral_bonus': return '🤝';
      case 'matching_bonus': return '⚖️';
      case 'level_override': return '🎯';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-400';
      case 'withdrawal': return 'text-red-400';
      case 'roi_credit': return 'text-blue-400';
      case 'referral_bonus': return 'text-purple-400';
      case 'matching_bonus': return 'text-yellow-400';
      case 'level_override': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading wallet data...</p>
        </div>
      </main>
    );
  }

  if (error && !walletData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white text-lg mb-4">{error}</p>
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
        {/* Navigation Breadcrumbs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-400">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-1 hover:text-purple-400 transition-colors"
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
            <span>›</span>
            <span className="text-white font-semibold">Wallet Management</span>
          </nav>
        </motion.div>

        {/* Header with Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <motion.button
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              </Link>
              <div>
                <TextAnimate 
                  animation="blurInUp"
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
                >
                  Wallet Management
                </TextAnimate>
                <p className="text-gray-400 text-lg">
                  Manage your Principal and Income wallets
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/dashboard">
                <ShimmerButton
                  shimmerColor="#a855f7"
                  background="rgba(139, 69, 219, 0.1)"
                  borderRadius="8px"
                  className="text-sm px-4 py-2 border-purple-500/30"
                >
                  📊 Dashboard
                </ShimmerButton>
              </Link>
              <Link href="/dashboard/teams">
                <ShimmerButton
                  shimmerColor="#3b82f6"
                  background="rgba(59, 130, 246, 0.1)"
                  borderRadius="8px"
                  className="text-sm px-4 py-2 border-blue-500/30"
                >
                  👥 Teams
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Wallet Overview Cards */}
        {walletData && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Principal Wallet */}
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-300 font-semibold">Principal Wallet</h3>
                <span className="text-2xl">🏦</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(walletData.principal.balance)}
              </p>
              <div className="space-y-1">
                <p className={`text-sm ${walletData.principal.locked ? 'text-red-400' : 'text-green-400'}`}>
                  {walletData.principal.locked ? '🔒 Locked' : '🔓 Unlocked'}
                </p>
                {walletData.principal.locked && (
                  <p className="text-xs text-gray-400">
                    Until: {new Date(walletData.principal.lockExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Income Wallet */}
            <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-300 font-semibold">Income Wallet</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(walletData.income.balance)}
              </p>
              <p className="text-green-400 text-sm">
                Available for withdrawal
              </p>
            </div>

            {/* Total Balance */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-300 font-semibold">Total Balance</h3>
                <span className="text-2xl">💎</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(walletData.summary.totalBalance)}
              </p>
              <p className="text-purple-400 text-sm">
                Principal + Income
              </p>
            </div>

            {/* Daily Earnings */}
            <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-300 font-semibold">Daily Earnings</h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(walletData.summary.dailyEarnings)}
              </p>
              <p className="text-yellow-400 text-sm">
                Per day ROI
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="flex space-x-1 bg-gray-900/50 rounded-lg p-1 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '📋' },
            { id: 'testing', label: 'Testing Tools', icon: '🧪' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'overview' && walletStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lifetime Statistics */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">📈</span>
                  Lifetime Statistics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Deposited</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(walletStats.lifetimeStats.totalDeposited)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Earned</span>
                    <span className="text-blue-400 font-semibold">
                      {formatCurrency(walletStats.lifetimeStats.totalEarned)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Withdrawn</span>
                    <span className="text-red-400 font-semibold">
                      {formatCurrency(walletStats.lifetimeStats.totalWithdrawn)}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Net Profit</span>
                      <span className={`font-bold text-lg ${
                        walletStats.lifetimeStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(walletStats.lifetimeStats.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projections */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">🔮</span>
                  ROI Projections
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-400 text-sm">Current ROI Rate</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {walletStats.projections.currentROIRate}%
                    </p>
                    <p className="text-gray-500 text-xs">per day</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Daily ROI</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(walletStats.projections.dailyROI)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Weekly ROI</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(walletStats.projections.weeklyROI)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Monthly ROI</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(walletStats.projections.monthlyROI)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Recent Transactions
              </h3>
              
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                          <div>
                            <p className="text-white font-semibold capitalize">
                              {tx.type.replace('_', ' ')}
                            </p>
                            <p className="text-gray-400 text-sm">{tx.description}</p>
                            <p className="text-gray-500 text-xs">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getTransactionColor(tx.type)}`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">
                            {tx.walletType} Wallet
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">📭</span>
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dummy Deposit */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Test Deposit
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add test funds to your Principal Wallet
                </p>
                
                <div className="space-y-4">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Amount ($50 min)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <PulsatingButton
                    pulseColor="#10b981"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3"
                    onClick={handleDummyDeposit}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Add Test Deposit'}
                  </PulsatingButton>
                </div>
              </div>

              {/* Dummy Income */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Test Income
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add test earnings to your Income Wallet
                </p>
                
                <div className="space-y-4">
                  <input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="Amount ($1 min)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <PulsatingButton
                    pulseColor="#3b82f6"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3"
                    onClick={handleDummyIncome}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Add Test Income'}
                  </PulsatingButton>
                </div>
              </div>

              {/* Withdrawal */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💸</span>
                  Withdraw Income
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Withdraw from your Income Wallet (5% fee)
                </p>
                
                <div className="space-y-4">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount ($50 min)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <ShimmerButton
                    shimmerColor="#ef4444"
                    background="rgba(239, 68, 68, 0.1)"
                    borderRadius="8px"
                    className="w-full text-red-400 border-red-500/30 py-3"
                    onClick={handleWithdrawal}
                    disabled={processing || !walletData?.income.canWithdraw}
                  >
                    {processing ? 'Processing...' : 'Withdraw Income'}
                  </ShimmerButton>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
} 