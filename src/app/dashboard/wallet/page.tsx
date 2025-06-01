"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AlertCircle, CheckCircle } from "lucide-react";

interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface WalletData {
  principal: {
    balance: number;
    totalDeposited: number;
    locked: boolean;
    lockExpiry: string;
  };
  income: {
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
    todayROI: number;
    compounding?: {
      active: boolean;
    };
    daysWithoutWithdrawal?: number;
  };
  daysActive: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { token } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setWalletData(data.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    // Validation
    if (!amount || amount < 500) {
      setDepositError("Minimum deposit is 500 USDT");
      return;
    }

    if (amount > 100000) {
      setDepositError("Maximum single deposit is 100,000 USDT");
      return;
    }

    setDepositLoading(true);
    setDepositError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USDT',
          network: 'ETH',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Deposit failed');
      }

      setDepositSuccess(true);
      setTimeout(() => {
        setShowDepositModal(false);
        setDepositAmount("");
        setDepositSuccess(false);
        fetchWalletData(); // Refresh wallet data
      }, 2000);
    } catch (error) {
      setDepositError(error instanceof Error ? error.message : 'Deposit failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-white">Loading wallet data...</div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
            <p className="text-gray-400">Manage your Principal and Income wallets</p>
          </div>

          {/* Two-Wallet System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Principal Wallet */}
            <div className="bg-gray-900/50 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Principal Wallet</h2>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/50 border border-blue-500/50 text-blue-300">
                  🔒 LOCKED
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${walletData?.principal?.balance?.toLocaleString() || '0.00'} USDT
                  </div>
                  <div className="text-sm text-gray-400">Your original investment</div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                  <div className="text-yellow-300 text-sm font-semibold">
                    🔒 Principal locked for 6 months minimum
                  </div>
                  <div className="text-yellow-200 text-xs mt-1">
                    Protects your capital from emotional decisions
                  </div>
                </div>

                <button 
                  onClick={() => setShowDepositModal(true)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  💰 Add More Funds (Min: 500 USDT)
                </button>
              </div>
            </div>

            {/* Income Wallet */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Income Wallet</h3>
                <span className="text-3xl">💰</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-blue-200 text-sm">Available Balance</div>
                  <div className="text-3xl font-bold text-white">
                    ${(walletData?.income?.balance ?? 0).toLocaleString()} USDT
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-blue-200">Total Earned</div>
                    <div className="text-white font-semibold">
                      ${walletData?.income?.totalEarned.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-200">Total Withdrawn</div>
                    <div className="text-white font-semibold">
                      ${walletData?.income?.totalWithdrawn.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Today's ROI */}
                <div className="border-t border-blue-400/30 pt-4">
                  <div className="text-blue-200 text-sm">Today's ROI</div>
                  <div className="text-xl font-bold text-green-400">
                    +${walletData?.income?.todayROI.toFixed(2)} USDT
                  </div>
                </div>
                
                {/* Compounding Status */}
                <div className="border-t border-blue-400/30 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-200 text-sm">Compounding Status</div>
                    {walletData?.income?.compounding?.active ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  
                  {walletData?.income?.compounding?.active ? (
                    <div className="bg-green-900/30 border border-green-500/30 rounded p-3">
                      <div className="text-green-300 text-sm font-semibold mb-1">
                        🚀 Compounding Active at 1.0% Daily!
                      </div>
                      <div className="text-green-200 text-xs">
                        Your entire income wallet is growing at 1.0% per day
                      </div>
                      <div className="text-yellow-300 text-xs mt-2">
                        ⚠️ Any withdrawal will reset compounding
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Days Without Withdrawal</span>
                        <span className="text-white font-semibold">
                          {walletData?.income?.daysWithoutWithdrawal || 0} / 7 days
                        </span>
                      </div>
                      
                      {(walletData?.income?.balance ?? 0) >= 50 ? (
                        <div className="bg-blue-900/50 rounded p-2">
                          <div className="text-blue-300 text-xs">
                            {7 - (walletData?.income?.daysWithoutWithdrawal || 0) > 0 ? (
                              <>Hold for {7 - (walletData?.income?.daysWithoutWithdrawal || 0)} more days to activate 1.0% daily compounding!</>
                            ) : (
                              <>Compounding will activate on your next daily processing!</>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-900/50 rounded p-2">
                          <div className="text-yellow-300 text-xs">
                            Minimum 50 USDT required for compounding (current: ${(walletData?.income?.balance ?? 0).toFixed(2)})
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6">
              <div className="text-purple-400 text-sm font-semibold mb-2">Portfolio Value</div>
              <div className="text-2xl font-bold text-white">
                ${((walletData?.principal?.balance || 0) + (walletData?.income?.balance ?? 0)).toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl p-6">
              <div className="text-orange-400 text-sm font-semibold mb-2">Daily ROI Rate</div>
              <div className="text-2xl font-bold text-white">0.75%</div>
            </div>

            <div className="bg-gray-900/50 border border-pink-500/30 rounded-xl p-6">
              <div className="text-pink-400 text-sm font-semibold mb-2">Days Active</div>
              <div className="text-2xl font-bold text-white">
                {walletData?.daysActive || 0}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-900/50 border border-gray-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {walletData?.transactions?.slice(0, 5).map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {tx.type === 'deposit' ? '💰' : 
                       tx.type === 'roi' ? '📈' : 
                       tx.type === 'leadership_pool' ? '💎' :
                       tx.type === 'compounding' ? '🚀' :
                       tx.type === 'matching_bonus' ? '🤝' :
                       tx.type === 'level_override' ? '🌳' :
                       tx.type === 'referral_bonus' ? '👥' :
                       '💸'}
                    </div>
                    <div>
                      <div className="text-white font-semibold capitalize">
                        {tx.type === 'roi' ? 'Daily ROI' :
                         tx.type === 'leadership_pool' ? 'Leadership Pool' :
                         tx.type === 'matching_bonus' ? 'Team Balance Bonus' :
                         tx.type === 'level_override' ? 'Network Earnings' :
                         tx.type === 'referral_bonus' ? 'Referral Bonus' :
                         tx.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <div className="text-gray-400">No transactions yet</div>
                  <div className="text-gray-500 text-sm">Make your first deposit to get started</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">💰 Make a Deposit</h3>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount("");
                  setDepositError("");
                  setDepositSuccess(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {depositSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Deposit Successful!</h4>
                <p className="text-gray-400">Your investment has been added to your Principal Wallet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Test System Notice */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm text-center">
                    <strong>🧪 TEST SYSTEM:</strong> No real money involved. Use any amount for testing!
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Deposit Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      setDepositError("");
                    }}
                    placeholder="Enter amount (min: 500)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  {depositError && (
                    <div className="mt-2 flex items-center text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {depositError}
                    </div>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Quick amounts:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 5000, 10000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ${amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Important Information:</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Minimum deposit: 500 USDT</li>
                    <li>• Your deposit will be locked for 6 months</li>
                    <li>• You&apos;ll earn 0.75% daily ROI (0.85% if qualified)</li>
                    <li>• ROI is paid to your Income Wallet daily</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount("");
                      setDepositError("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={depositLoading || !depositAmount}
                    className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors ${
                      depositLoading || !depositAmount
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {depositLoading ? 'Processing...' : 'Confirm Deposit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}