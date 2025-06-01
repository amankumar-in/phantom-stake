"use client";

import { useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-white font-bold text-lg">P</span>
            </motion.div>
            <TextAnimate 
              animation="slideLeft" 
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Phantom Stake
            </TextAnimate>
          </Link>

          {/* Phase Timeline Bar */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-900/50 rounded-full p-1 border border-purple-500/30">
            {[
              { name: "Phase I", status: "coming-soon", date: "Aug 2025" },
              { name: "Phase II", status: "future", date: "Oct 2026" },
              { name: "Phase III", status: "future", date: "Oct 2027" },
              { name: "Phase IV", status: "future", date: "Oct 2028" },
            ].map((phase) => (
              <motion.div
                key={phase.name}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  phase.status === "coming-soon"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="font-semibold">{phase.name}</div>
                  <div className="text-[10px] opacity-75">{phase.date}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {user ? (
                // Authenticated navigation
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/wallet" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Wallet
                  </Link>
                  <Link 
                    href="/calculator" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Calculator
                  </Link>
                  <Link 
                    href="/programs" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Programs
                  </Link>
                </>
              ) : (
                // Public navigation
                <>
                  <Link 
                    href="/how-it-works" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    How It Works
                  </Link>
                  <Link 
                    href="/programs" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Programs
                  </Link>
                  <Link 
                    href="/calculator" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    Calculator
                  </Link>
                  <Link 
                    href="/faq" 
                    className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    FAQ
                  </Link>
                </>
              )}
            </nav>

            {user ? (
              // Authenticated user menu
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Welcome back</p>
                  <p className="text-sm text-white font-semibold">{user.firstName}</p>
                </div>
                
                <div className="relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {user.firstName.charAt(0).toUpperCase()}
                  </motion.button>
                  
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        👤 Profile
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              // Public user buttons
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <ShimmerButton
                    shimmerColor="#a855f7"
                    background="rgba(139, 69, 219, 0.1)"
                    borderRadius="8px"
                    className="text-sm px-4 py-2 border-purple-500/30"
                  >
                    Sign In
                  </ShimmerButton>
                </Link>
                
                <Link href="/register">
                  <PulsatingButton 
                    pulseColor="#ec4899"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2"
                  >
                    Join Now
                  </PulsatingButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Always rendered now (if md:hidden matches) */}
          <motion.button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu - Always rendered if isMenuOpen (parent controls Header visibility) */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-purple-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              {/* Phase Timeline - Mobile */}
              <div className="flex justify-center space-x-1 mb-4">
                {[
                  { name: "I", status: "coming-soon" },
                  { name: "II", status: "future" },
                  { name: "III", status: "future" },
                  { name: "IV", status: "future" },
                ].map((phase) => (
                  <div
                    key={phase.name}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                      phase.status === "coming-soon"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {phase.name}
                  </div>
                ))}
              </div>

              {/* User Info - Mobile */}
              {user && (
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <p className="text-white font-semibold">
                    Welcome, {user.firstName}!
                  </p>
                  <p className="text-gray-400 text-sm">
                    @{user.username}
                  </p>
                </div>
              )}

              {/* Navigation Links */}
              {user ? (
                // Authenticated mobile navigation
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/dashboard/wallet"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    💳 Wallet
                  </Link>
                  <Link
                    href="/calculator"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📱 Calculator
                  </Link>
                  <Link
                    href="/programs"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📚 Programs
                  </Link>
                  <Link
                    href="/faq"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ❓ FAQ
                  </Link>
                  <Link
                    href="/profile"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                </>
              ) : (
                // Public mobile navigation
                <>
                  <Link
                    href="/how-it-works"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/programs"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Programs
                  </Link>
                  <Link
                    href="/calculator"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Calculator
                  </Link>
                  <Link
                    href="/faq"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                </>
              )}

              {/* Mobile Buttons */}
              <div className="space-y-3 pt-4">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    🚪 Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login">
                      <ShimmerButton
                        shimmerColor="#a855f7"
                        background="rgba(139, 69, 219, 0.1)"
                        borderRadius="8px"
                        className="w-full text-sm py-2 border-purple-500/30"
                      >
                        Sign In
                      </ShimmerButton>
                    </Link>
                    
                    <Link href="/register">
                      <PulsatingButton 
                        pulseColor="#ec4899"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm py-2"
                      >
                        Join Now
                      </PulsatingButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
} 