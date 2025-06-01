"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { BarChart, DollarSign, Wallet, Users, UserPlus, Trophy, CreditCard } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: BarChart, label: 'Dashboard', path: '/dashboard' },
    { icon: DollarSign, label: 'Portfolio', path: '/dashboard/portfolio' },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: Users, label: 'My Team', path: '/dashboard/teams' },
    { icon: UserPlus, label: 'Referrals', path: '/dashboard/referrals' },
    { icon: Trophy, label: 'Leadership Pools', path: '/dashboard/pools' },
    { icon: CreditCard, label: 'Withdraw', path: '/dashboard/withdraw' },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-800 px-6 bg-gray-900">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-lg font-bold text-white truncate">Phantom Stake</h1>
            </div>
          </div>

          {/* User Info */}
          <div className="border-b border-gray-800 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{user?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-gray-800 p-6 space-y-2">
            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <div className="h-6 w-6 flex flex-col justify-center space-y-1">
              <div className="h-0.5 w-6 bg-current"></div>
              <div className="h-0.5 w-6 bg-current"></div>
              <div className="h-0.5 w-6 bg-current"></div>
            </div>
          </button>
          <div className="text-lg font-semibold text-white">Phantom Stake</div>
        </div>

        {/* Page content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}