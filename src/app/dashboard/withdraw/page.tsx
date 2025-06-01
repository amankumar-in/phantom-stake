"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface WithdrawalRequest {
  _id: string;
  amount: number;
  fees: {
    platform: number;
    gas: number;
    total: number;
  };
  netAmount: number;
  walletAddress: string;
  network: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  transactionHash?: string;
}

export default function WithdrawPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incomeBalance, setIncomeBalance] = useState(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("ETH");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  useEffect(() => {
    fetchWalletData();
    fetchWithdrawalHistory();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setIncomeBalance(data.data.income.balance);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setWithdrawalHistory(data.data.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    // Validation
    if (!amount || amount < 1000) {
      setWithdrawError("Minimum withdrawal is 1,000 USDT");
      return;
    }

    if (amount > incomeBalance) {
      setWithdrawError("Insufficient balance");
      return;
    }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setWithdrawError("Invalid wallet address");
      return;
    }

    setWithdrawLoading(true);
    setWithdrawError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdraw-income`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          walletAddress,
          network,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Withdrawal failed');
      }

      setWithdrawSuccess(true);
      setIncomeBalance(data.data.newBalance);
      
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setWalletAddress("");
        setWithdrawSuccess(false);
        fetchWithdrawalHistory();
      }, 3000);
    } catch (error) {
      setWithdrawError(error instanceof Error ? error.message : 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const cancelWithdrawal = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this withdrawal request?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdrawals/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchWalletData();
        fetchWithdrawalHistory();
      }
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="text-white">Loading withdrawal data...</div>
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
            <h1 className="text-3xl font-bold text-white mb-2">💸 Withdraw Funds</h1>
            <p className="text-gray-400">Request withdrawals from your income wallet</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 mb-8 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Available Balance</h2>
                <div className="text-3xl font-bold text-white">
                  ${incomeBalance.toLocaleString()} USDT
                </div>
                <p className="text-green-300 text-sm mt-2">
                  From your Income Wallet • Min withdrawal: $1,000
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={incomeBalance < 1000}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  incomeBalance >= 1000
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Request Withdrawal
              </button>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Withdrawal History</h3>
            </div>
            
            {withdrawalHistory.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400">No withdrawal requests yet</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Fees</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Net Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {withdrawalHistory.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 text-sm text-white">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          ${request.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          ${request.fees.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-400">
                          ${request.netAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Details
                            </button>
                            {request.status === 'pending' && (
                              <button
                                onClick={() => cancelWithdrawal(request._id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-4">📋 Withdrawal Process</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Submit withdrawal request with your wallet address</li>
                <li>• Your balance is updated immediately</li>
                <li>• Admin reviews and approves the request</li>
                <li>• Funds are sent to your wallet (24-48 hours)</li>
                <li>• You can cancel pending requests anytime</li>
              </ul>
            </div>

            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">💰 Fees & Limits</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Minimum withdrawal: 1,000 USDT</li>
                <li>• Platform fee: 5% of withdrawal amount</li>
                <li>• Network gas fee: 5 USDT</li>
                <li>• Processing time: 24-48 hours</li>
                <li>• Withdrawals break compounding status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Request Withdrawal</h3>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  setWalletAddress("");
                  setWithdrawError("");
                  setWithdrawSuccess(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Request Submitted!</h4>
                <p className="text-gray-400">Your withdrawal is being processed.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Withdrawal Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={incomeBalance}
                    step="100"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setWithdrawError("");
                    }}
                    placeholder="Enter amount (min: 1,000)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value);
                      setWithdrawError("");
                    }}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                {/* Network Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Network
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="ETH">Ethereum (ERC-20)</option>
                    <option value="BSC">Binance Smart Chain (BEP-20)</option>
                    <option value="POLYGON">Polygon</option>
                    <option value="TRON">Tron (TRC-20)</option>
                  </select>
                </div>

                {/* Fee Preview */}
                {withdrawAmount && parseFloat(withdrawAmount) >= 1000 && (
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">${parseFloat(withdrawAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee (5%):</span>
                      <span className="text-white">-${(parseFloat(withdrawAmount) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Fee:</span>
                      <span className="text-white">-$5.00</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
                      <span className="text-gray-400">You'll Receive:</span>
                      <span className="text-green-400">
                        ${(parseFloat(withdrawAmount) - (parseFloat(withdrawAmount) * 0.05) - 5).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {withdrawError && (
                  <div className="flex items-center text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {withdrawError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount("");
                      setWalletAddress("");
                      setWithdrawError("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 1000 || !walletAddress}
                    className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors ${
                      withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 1000 || !walletAddress
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {withdrawLoading ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Withdrawal Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Request ID</div>
                  <div className="text-white font-mono text-xs">{selectedRequest._id}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Status</div>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Amount</div>
                  <div className="text-white">${selectedRequest.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Net Amount</div>
                  <div className="text-green-400 font-semibold">${selectedRequest.netAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Network</div>
                  <div className="text-white">{selectedRequest.network}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Requested</div>
                  <div className="text-white">{new Date(selectedRequest.requestedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-sm mb-1">Wallet Address</div>
                <div className="text-white font-mono text-sm bg-gray-700 p-2 rounded">
                  {selectedRequest.walletAddress}
                </div>
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                  <div className="text-red-400 font-semibold mb-1">Rejection Reason</div>
                  <div className="text-red-300 text-sm">{selectedRequest.rejectionReason}</div>
                </div>
              )}

              {selectedRequest.transactionHash && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Transaction Hash</div>
                  <div className="text-white font-mono text-xs bg-gray-700 p-2 rounded break-all">
                    {selectedRequest.transactionHash}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 