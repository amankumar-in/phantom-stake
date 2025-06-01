// Timestamp: 1719522001
"use client";

import { useEffect, useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
      </div>
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className={`mb-8 space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <TextAnimate 
              animation="blurInUp" 
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
            >
              Phantom Stake
            </TextAnimate>
            
            {/* Desktop 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Left Column - Live Profit Simulator */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-500/40 rounded-2xl p-8 backdrop-blur-sm"
              >
                <div className="text-center mb-6">
                  <div className="text-sm text-green-400 font-semibold mb-2 animate-pulse">🔥 LIVE PROFIT SIMULATION</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Your Money Working 24/7</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Investment Input */}
                  <div className="bg-black/30 rounded-xl p-6 border border-purple-500/30">
                    <div className="text-center">
                      <div className="text-purple-300 text-sm mb-2">Your Investment</div>
                      <div className="text-3xl font-bold text-white mb-2">$5,000</div>
                      <div className="text-xs text-gray-400">Safe in Principal Wallet</div>
                    </div>
                  </div>

                  {/* Daily Earnings Counter */}
                  <div className="bg-black/30 rounded-xl p-6 border border-green-500/30">
                    <div className="text-center">
                      <div className="text-green-300 text-sm mb-2">Daily Earnings</div>
                      <motion.div 
                        className="text-3xl font-bold text-green-400 mb-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        $37.50
                      </motion.div>
                      <div className="text-xs text-gray-400">0.75% Daily ROI</div>
                    </div>
                  </div>

                  {/* Monthly Projection */}
                  <div className="bg-black/30 rounded-xl p-6 border border-yellow-500/30">
                    <div className="text-center">
                      <div className="text-yellow-300 text-sm mb-2">Monthly Income</div>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">$1,125</div>
                      <div className="text-xs text-gray-400">Pure Profit</div>
                    </div>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>6-Month Journey</span>
                    <span>$11,750 Total Value</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>
                  <div className="text-center mt-2 text-green-400 font-semibold text-sm">
                    135% Profit in 6 Months 🚀
                  </div>
                </div>

                {/* Hero CTAs - Right after profit simulation */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <Link href="/register">
                    <PulsatingButton 
                      pulseColor="#10b981"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-purple-600 text-white font-semibold text-base w-full sm:w-auto"
                    >
                      🚀 Start Earning Now
                    </PulsatingButton>
                  </Link>
                  <Link href="/calculator">
                    <ShimmerButton
                      shimmerColor="#a855f7"
                      background="rgba(139, 69, 219, 0.1)"
                      className="px-6 py-3 border-purple-400 text-purple-400 font-semibold text-base hover:text-white w-full sm:w-auto"
                    >
                      📊 Calculate Returns
                    </ShimmerButton>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Column - Stats & Program Info */}
              <div className="space-y-6">
                {/* Trading Fund Stats */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-green-400 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      $50M+
                    </motion.div>
                    <div className="text-xs text-gray-400">Trading Fund</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-blue-400 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      $550K
                    </motion.div>
                    <div className="text-xs text-gray-400">Daily Profits</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-purple-400 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      24/7
                    </motion.div>
                    <div className="text-xs text-gray-400">AI Trading</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    >
                      426
                    </motion.div>
                    <div className="text-xs text-gray-400">Program Days</div>
                  </div>
                </motion.div>

                {/* Program Launch Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="bg-gradient-to-r from-green-900/30 to-purple-900/30 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <motion.span 
                        className="w-3 h-3 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-green-400 font-semibold">Program I: Founders Edition</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white mb-1">August 1, 2025</div>
                      <div className="text-purple-300">Early Access Launch</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">ROI Range</div>
                        <div className="font-bold text-green-300">0.75%-1.0%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Minimum</div>
                        <div className="font-bold text-blue-300">$50</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="font-bold text-purple-300">426 Days</div>
                      </div>
                    </div>

                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4">
                      <div className="text-yellow-300 text-sm font-semibold">
                        ✨ Founder Benefits: VIP Support • Exclusive Updates • Priority Access
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile Floating CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="md:hidden fixed bottom-4 left-4 right-4 z-50"
            >
              <div className="bg-gradient-to-r from-green-600 to-purple-600 rounded-2xl p-4 backdrop-blur-sm shadow-2xl border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">Ready to Join?</div>
                    <div className="text-green-200 text-xs">0.75% daily • $50 minimum</div>
                  </div>
                  <Link href="/register">
                    <PulsatingButton 
                      pulseColor="#10b981"
                      className="px-4 py-2 bg-white text-green-600 font-semibold text-sm rounded-xl"
                    >
                      Join Now
                    </PulsatingButton>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Quick Access CTAs */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4 max-w-4xl mx-auto backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/register" className="w-full">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center hover:bg-green-600/30 transition-colors"
                  >
                    <div className="text-green-400 font-semibold text-sm">🎯 Get Started</div>
                    <div className="text-white text-xs">Join Program I</div>
                  </motion.button>
                </Link>
                <Link href="/calculator" className="w-full">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center hover:bg-blue-600/30 transition-colors"
                  >
                    <div className="text-blue-400 font-semibold text-sm">📱 Calculator</div>
                    <div className="text-white text-xs">See Your Profits</div>
                  </motion.button>
                </Link>
                <Link href="/how-it-works" className="w-full">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center hover:bg-purple-600/30 transition-colors"
                  >
                    <div className="text-purple-400 font-semibold text-sm">💡 Learn More</div>
                    <div className="text-white text-xs">How It Works</div>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Interactive Profit Methods */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">How We Generate Your Returns</h3>
                <p className="text-gray-400">Professional strategies working around the clock</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/how-it-works">
                  <motion.div 
                    className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-sm font-bold text-blue-300 mb-1">Arbitrage</div>
                    <div className="text-xs text-gray-400 mb-2">Cross-exchange trading</div>
                    <div className="text-lg font-bold text-white">$180K</div>
                    <div className="text-xs text-blue-300">Daily profit</div>
                  </motion.div>
                </Link>

                <Link href="/how-it-works">
                  <motion.div 
                    className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-3xl mb-2">🌉</div>
                    <div className="text-sm font-bold text-green-300 mb-1">Bridging</div>
                    <div className="text-xs text-gray-400 mb-2">Cross-chain profits</div>
                    <div className="text-lg font-bold text-white">$150K</div>
                    <div className="text-xs text-green-300">Daily profit</div>
                  </motion.div>
                </Link>

                <Link href="/how-it-works">
                  <motion.div 
                    className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-3xl mb-2">🚜</div>
                    <div className="text-sm font-bold text-purple-300 mb-1">DeFi Farming</div>
                    <div className="text-xs text-gray-400 mb-2">Yield optimization</div>
                    <div className="text-lg font-bold text-white">$120K</div>
                    <div className="text-xs text-purple-300">Daily profit</div>
                  </motion.div>
                </Link>

                <Link href="/how-it-works">
                  <motion.div 
                    className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-sm font-bold text-yellow-300 mb-1">MEV Trading</div>
                    <div className="text-xs text-gray-400 mb-2">Flash loan strategies</div>
                    <div className="text-lg font-bold text-white">$100K</div>
                    <div className="text-xs text-yellow-300">Daily profit</div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              <Link href="/calculator">
                <PulsatingButton 
                  pulseColor="#10b981"
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-purple-600 text-white font-semibold text-lg w-full sm:w-auto"
                >
                  🚀 Calculate My Profits
                </PulsatingButton>
              </Link>
              <Link href="/how-it-works">
                <ShimmerButton
                  shimmerColor="#a855f7"
                  background="rgba(139, 69, 219, 0.1)"
                  className="px-8 py-4 border-purple-400 text-purple-400 font-semibold text-lg hover:text-white w-full sm:w-auto"
                >
                  📈 See Live Strategy
                </ShimmerButton>
              </Link>
            </motion.div>

            {/* Quick Trust Signals */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Principal 100% Protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>Withdraw Income Anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>AI-Powered Trading</span>
              </div>
            </motion.div>
          </div>

          {/* Business Model Highlight */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="mt-20 mb-16"
          >
            <div className="text-center mb-12">
              <TextAnimate 
                animation="slideUp" 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                How We Generate Your 0.75% Daily Returns
              </TextAnimate>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Our professional trading team uses multiple proven strategies to consistently generate profits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-blue-300 mb-3">Arbitrage Trading</h3>
                <p className="text-gray-300 text-sm mb-3">Buy low on one exchange, sell high on another</p>
                <div className="bg-blue-800/30 rounded-lg p-3">
                  <div className="text-xl font-bold text-white">$180,000</div>
                  <p className="text-blue-300 text-xs">Daily Profit (0.36%)</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">🌉</div>
                <h3 className="text-lg font-bold text-green-300 mb-3">Cross-Chain Bridging</h3>
                <p className="text-gray-300 text-sm mb-3">Move crypto between blockchains for profit</p>
                <div className="bg-green-800/30 rounded-lg p-3">
                  <div className="text-xl font-bold text-white">$150,000</div>
                  <p className="text-green-300 text-xs">Daily Profit (0.30%)</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">🚜</div>
                <h3 className="text-lg font-bold text-purple-300 mb-3">DeFi Yield Farming</h3>
                <p className="text-gray-300 text-sm mb-3">Earn rewards from liquidity pools</p>
                <div className="bg-purple-800/30 rounded-lg p-3">
                  <div className="text-xl font-bold text-white">$120,000</div>
                  <p className="text-purple-300 text-xs">Daily Profit (0.24%)</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-yellow-300 mb-3">MEV Trading</h3>
                <p className="text-gray-300 text-sm mb-3">Advanced flash loan strategies</p>
                <div className="bg-yellow-800/30 rounded-lg p-3">
                  <div className="text-xl font-bold text-white">$100,000</div>
                  <p className="text-yellow-300 text-xs">Daily Profit (0.20%)</p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl p-6"
            >
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white mb-4">💰 Total Daily Revenue: $550,000</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xl font-bold text-green-300">$375,000</div>
                    <p className="text-gray-300 text-sm">Paid to Investors (0.75%)</p>
                    <p className="text-green-300 text-xs">68% of profits shared</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-300">$175,000</div>
                    <p className="text-gray-300 text-sm">Company Operations</p>
                    <p className="text-blue-300 text-xs">32% for growth & security</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-300">1.1%</div>
                    <p className="text-gray-300 text-sm">Total Fund Performance</p>
                    <p className="text-purple-300 text-xs">From $50M trading capital</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Investment Examples */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20 mb-16"
          >
            <div className="text-center mb-12">
              <TextAnimate 
                animation="slideUp" 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Real Investment Examples
              </TextAnimate>
              <p className="text-gray-400 max-w-2xl mx-auto">
                See exactly how much you could earn with different investment amounts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { amount: 1000, label: "Popular Choice", color: "blue" },
                { amount: 5000, label: "Professional", color: "green" },
                { amount: 10000, label: "Elite Investor", color: "purple" }
              ].map((example, index) => (
                <motion.div 
                  key={example.amount}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-${example.color}-900/30 border border-${example.color}-500/30 rounded-xl p-6`}
                >
                  <div className="text-center mb-4">
                    <div className="text-xs text-gray-400 mb-1">{example.label}</div>
                    <div className="text-2xl font-bold text-white">${example.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Investment</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`bg-${example.color}-800/30 rounded-lg p-3`}>
                      <div className="text-sm text-gray-300">Daily Income</div>
                      <div className={`text-lg font-bold text-${example.color}-300`}>
                        ${(example.amount * 0.0075).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className={`bg-${example.color}-800/30 rounded-lg p-3`}>
                      <div className="text-sm text-gray-300">Monthly Income</div>
                      <div className={`text-lg font-bold text-${example.color}-300`}>
                        ${(example.amount * 0.0075 * 30).toFixed(0)}
                      </div>
                    </div>
                    
                    <div className={`bg-${example.color}-800/30 rounded-lg p-3`}>
                      <div className="text-sm text-gray-300">6-Month Total</div>
                      <div className={`text-lg font-bold text-${example.color}-300`}>
                        ${(example.amount + example.amount * 0.0075 * 180).toFixed(0)}
                      </div>
                      <div className="text-xs text-green-300">
                        +{(((example.amount * 0.0075 * 180) / example.amount) * 100).toFixed(0)}% profit
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <TextAnimate 
                animation="slideUp" 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Program Timeline
              </TextAnimate>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Four sequential programs, each with unique timeframes and escalating rewards. Only Program I is available for registration.
              </p>
            </div>

            {/* Timeline Visual */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 via-gray-600 to-gray-800"></div>
              
              {/* Timeline Items */}
              <div className="space-y-16">
                {[
                  { 
                    phase: "Program I", 
                    name: "Founders' Program", 
                    date: "Aug 1, 2025 → Sep 30, 2026", 
                    roi: "0.75% - 1.0%", 
                    status: "coming-soon",
                    description: "Exclusive early access with founder benefits and highest priority support."
                  },
                  { 
                    phase: "Program II", 
                    name: "Growth Program", 
                    date: "Oct 1, 2026 → Sep 30, 2027", 
                    roi: "0.80% - 1.05%", 
                    status: "future",
                    description: "Enhanced features and improved reward structures for growing community."
                  },
                  { 
                    phase: "Program III", 
                    name: "Elite Program", 
                    date: "Oct 1, 2027 → Sep 30, 2028", 
                    roi: "0.85% - 1.10%", 
                    status: "future",
                    description: "Premium tier with advanced staking mechanisms and elite rewards."
                  },
                  { 
                    phase: "Program IV", 
                    name: "Legacy Program", 
                    date: "Oct 1, 2028 → Ongoing", 
                    roi: "0.90% - 1.15%", 
                    status: "future",
                    description: "Long-term sustainable program with DAO governance and maximum returns."
                  },
                ].map((program, index) => (
                  <motion.div
                    key={program.phase}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className={`p-6 rounded-xl border ${
                        program.status === 'coming-soon' 
                          ? 'bg-gradient-to-br from-green-900/50 to-purple-900/50 border-green-500/50 shadow-lg shadow-green-500/20' 
                          : 'bg-gray-900/50 border-gray-600/30'
                      }`}>
                        <div className="flex items-center space-x-2 mb-3">
                          {program.status === 'coming-soon' ? (
                            <>
                              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="text-green-400 font-semibold text-sm">Available Soon</span>
                            </>
                          ) : (
                            <>
                              <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                              <span className="text-gray-500 font-semibold text-sm">Future Phase</span>
                            </>
                          )}
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-1 ${
                          program.status === 'coming-soon' ? 'text-white' : 'text-gray-400'
                        }`}>
                          {program.phase}
                        </h3>
                        <h4 className={`text-lg mb-2 ${
                          program.status === 'coming-soon' ? 'text-purple-300' : 'text-gray-500'
                        }`}>
                          {program.name}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          program.status === 'coming-soon' ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {program.date}
                        </p>
                        <p className={`font-bold mb-3 ${
                          program.status === 'coming-soon' ? 'text-white' : 'text-gray-400'
                        }`}>
                          {program.roi} Daily ROI
                        </p>
                        <p className={`text-xs ${
                          program.status === 'coming-soon' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {program.description}
                        </p>
                        
                        {program.status === 'coming-soon' && (
                          <div className="mt-4">
                            <Link href="/register">
                              <PulsatingButton 
                                pulseColor="#10b981"
                                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-sm py-2"
                              >
                                Prepare to Join
                              </PulsatingButton>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline Node */}
                    <div className="w-2/12 flex justify-center">
                      <div className={`w-6 h-6 rounded-full border-4 ${
                        program.status === 'coming-soon' 
                          ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50' 
                          : 'bg-gray-700 border-gray-500'
                      }`}></div>
                    </div>
                    
                    <div className="w-5/12"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
              <div className="text-4xl font-bold text-green-400 mb-2">$50M+</div>
              <p className="text-gray-300">Trading Capital</p>
              <p className="text-xs text-gray-500 mt-1">Professional fund size</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
              <div className="text-4xl font-bold text-blue-400 mb-2">550K+</div>
              <p className="text-gray-300">Daily Profits ($)</p>
              <p className="text-xs text-gray-500 mt-1">Generated through arbitrage</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <p className="text-gray-300">AI Trading Bots</p>
              <p className="text-xs text-gray-500 mt-1">Never miss opportunities</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
              <div className="text-4xl font-bold text-yellow-400 mb-2">426</div>
              <p className="text-gray-300">Program Days</p>
              <p className="text-xs text-gray-500 mt-1">Aug 2025 - Sep 2026</p>
            </div>
          </motion.div>

          {/* How It Works - Key Benefits */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <TextAnimate 
                animation="slideUp" 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Dual-Wallet Security System
              </TextAnimate>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Your investment is protected through our innovative dual-wallet system that separates your principal from daily returns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6"
              >
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-white mb-3">Principal Wallet</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Your original USDT investment</li>
                  <li>• <span className="text-blue-300 font-semibold">100% protected</span> - never at risk</li>
                  <li>• Locked for minimum 6 months for stability</li>
                  <li>• Fully withdrawable after lock period</li>
                  <li>• Generates your daily 0.75% returns</li>
                </ul>
                
                <div className="mt-4 bg-blue-800/30 rounded-lg p-3">
                  <p className="text-blue-300 text-xs font-semibold">
                    Example: $5,000 investment stays safe in Principal Wallet
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6"
              >
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-3">Income Wallet</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Daily returns from principal wallet</li>
                  <li>• <span className="text-green-300 font-semibold">Withdrawable anytime</span> (min $1,000)</li>
                  <li>• Compounds automatically if left untouched</li>
                  <li>• Typically doubles your principal in 6 months</li>
                  <li>• Pure profit you can access daily</li>
                </ul>

                <div className="mt-4 bg-green-800/30 rounded-lg p-3">
                  <p className="text-green-300 text-xs font-semibold">
                    Example: $37.50 daily from $5,000 → $1,125 monthly income
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 max-w-4xl mx-auto"
            >
              <h4 className="text-xl font-bold text-white mb-4 text-center">💡 Why This System Works for Investors</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h5 className="text-purple-300 font-semibold mb-2">Risk Management</h5>
                  <p className="text-gray-300">Your principal is never used for trading, ensuring capital preservation</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔄</div>
                  <h5 className="text-purple-300 font-semibold mb-2">Liquidity Access</h5>
                  <p className="text-gray-300">Access your daily profits anytime while principal grows safely</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h5 className="text-purple-300 font-semibold mb-2">Compound Growth</h5>
                  <p className="text-gray-300">Leave returns untouched to accelerate your wealth building</p>
                </div>
              </div>
              
              <div className="mt-6 bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h5 className="text-yellow-300 font-bold text-center mb-3">💰 Real Performance Example</h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <div className="font-bold text-white">Month 1</div>
                    <div className="text-yellow-300">Principal: $10,000</div>
                    <div className="text-green-300">Income: $2,250</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">Month 3</div>
                    <div className="text-yellow-300">Principal: $10,000</div>
                    <div className="text-green-300">Income: $6,750</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">Month 6</div>
                    <div className="text-blue-300">Principal: $10,000 (unlocked)</div>
                    <div className="text-green-300">Income: $13,500</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">Total Value</div>
                    <div className="text-purple-300">$23,500</div>
                    <div className="text-green-400">+135% profit</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Final CTA Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-green-900/50 to-purple-900/50 border border-green-500/30 rounded-xl p-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Building Wealth?</h3>
                <p className="text-gray-300 mb-6 text-lg">
                  Join the exclusive Program I Founders circle and secure your position in the future of decentralized finance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Link href="/calculator">
                    <PulsatingButton 
                      pulseColor="#10b981"
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-lg w-full sm:w-auto"
                    >
                      Calculate My Returns
                    </PulsatingButton>
                  </Link>
                  <Link href="/how-it-works">
                    <ShimmerButton
                      shimmerColor="#a855f7"
                      background="rgba(139, 69, 219, 0.1)"
                      borderRadius="8px"
                      className="px-8 py-4 text-purple-400 border-purple-500/30 font-semibold text-lg w-full sm:w-auto"
                    >
                      Learn Our Strategy
                    </ShimmerButton>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Minimum $50 Investment</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Launch: August 1, 2025</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Founders Benefits Included</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}