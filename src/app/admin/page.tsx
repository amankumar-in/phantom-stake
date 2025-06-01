"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface WithdrawalStats {
  totalRequests: number;
  totalAmount: number;
  totalFees: number;
  totalNet: number;
  pending: number;
  pendingAmount: number;
  approved: number;
  completed: number;
  rejected: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading statistics...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats?.pending || 0}</span>
          </div>
          <h3 className="text-gray-400 text-sm">Pending Withdrawals</h3>
          <p className="text-yellow-400 font-semibold">${stats?.pendingAmount?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats?.completed || 0}</span>
          </div>
          <h3 className="text-gray-400 text-sm">Completed Withdrawals</h3>
          <p className="text-green-400 font-semibold">${stats?.totalNet?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats?.totalRequests || 0}</span>
          </div>
          <h3 className="text-gray-400 text-sm">Total Requests</h3>
          <p className="text-blue-400 font-semibold">${stats?.totalAmount?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">${stats?.totalFees?.toFixed(2) || 0}</span>
          </div>
          <h3 className="text-gray-400 text-sm">Total Fees Collected</h3>
          <p className="text-purple-400 text-sm">Platform + Gas Fees</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/withdrawals"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <span className="font-semibold">Manage Withdrawals</span>
          </a>
          <a
            href="/admin/users"
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <span className="text-2xl mb-2">👥</span>
            <span className="font-semibold">View Users</span>
          </a>
          <a
            href="/admin/reports"
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="font-semibold">Generate Reports</span>
          </a>
        </div>
      </div>
    </div>
  );
} 