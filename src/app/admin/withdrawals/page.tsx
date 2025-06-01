"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WithdrawalRequest {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  amount: number;
  platformFee: number;
  gasFee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  txHash?: string;
  approvedBy?: {
    username: string;
  };
}

type FilterType = 'all' | 'pending' | 'approved' | 'completed' | 'rejected';

export default function AdminWithdrawals() {
  const { token } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('pending');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.data.withdrawals);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;
    
    setProcessingId(requestId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchWithdrawals();
        alert('Withdrawal approved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setProcessingId(requestId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        await fetchWithdrawals();
        alert('Withdrawal rejected successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    const txHash = prompt('Enter transaction hash (optional):');
    
    setProcessingId(requestId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'completed',
          txHash: txHash || undefined
        }),
      });
      
      if (response.ok) {
        await fetchWithdrawals();
        alert('Withdrawal marked as completed!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      alert('Failed to update withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-400/10 text-yellow-400',
      approved: 'bg-blue-400/10 text-blue-400',
      completed: 'bg-green-400/10 text-green-400',
      rejected: 'bg-red-400/10 text-red-400',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="text-white">Loading withdrawals...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Withdrawal Management</h1>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        {['all', 'pending', 'approved', 'completed', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as FilterType)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-sm">
              ({withdrawals.filter(w => f === 'all' || w.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Wallet Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {withdrawal.userId.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {withdrawal.userId.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${withdrawal.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>
                      <div>Platform: ${withdrawal.platformFee.toFixed(2)}</div>
                      <div>Gas: ${withdrawal.gasFee.toFixed(2)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                    ${withdrawal.netAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="truncate max-w-xs" title={withdrawal.walletAddress}>
                      {withdrawal.walletAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(withdrawal.status)}
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {withdrawal.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(withdrawal._id)}
                            disabled={processingId === withdrawal._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(withdrawal._id)}
                            disabled={processingId === withdrawal._id}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {withdrawal.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkCompleted(withdrawal._id)}
                          disabled={processingId === withdrawal._id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {withdrawal.status === 'completed' && withdrawal.txHash && (
                        <a
                          href={`https://etherscan.io/tx/${withdrawal.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          View TX
                        </a>
                      )}
                      {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                        <span className="text-red-400 text-xs">
                          {withdrawal.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 