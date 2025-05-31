"use client";

import { useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Connect Your Wallet",
      icon: "🔗",
      description: "Connect your crypto wallet to get started",
      details: [
        "Use MetaMask or any Ethereum wallet",
        "Make sure you have USDT (Tether) coins",
        "We only work on Ethereum network",
        "Your wallet = your bank account"
      ]
    },
    {
      title: "Deposit Money",
      icon: "💰",
      description: "Put your USDT into the program",
      details: [
        "Minimum deposit: $50 USDT",
        "Your money goes to 'Principal Wallet'",
        "This money is safe and locked for 6 months",
        "You can deposit more anytime"
      ]
    },
    {
      title: "Earn Daily Returns",
      icon: "📈",
      description: "Get 0.75% of your money back every day",
      details: [
        "Returns go to your 'Income Wallet'",
        "Example: $1,000 → $7.50 daily",
        "Automatic - no work needed",
        "Income wallet can be withdrawn anytime"
      ]
    },
    {
      title: "Invite Friends (Optional)",
      icon: "👥",
      description: "Get 10% bonus when friends join",
      details: [
        "Share your referral link",
        "When friend invests $1,000 → You get $100",
        "Bonus paid instantly",
        "Build a team for bigger rewards"
      ]
    },
    {
      title: "Withdraw Your Money",
      icon: "💸",
      description: "Take out your earnings anytime",
      details: [
        "Withdraw income anytime (minimum $1,000)",
        "5% withdrawal fee",
        "Principal unlocked after 6 months",
        "Money sent to your wallet"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TextAnimate 
            animation="blurInUp"
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            How It Works
          </TextAnimate>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Simple steps to start making money with Phantom Stake.
            <br />Program I starts <span className="text-green-400 font-semibold">August 1, 2025</span>.
          </p>
        </motion.div>

        {/* What Is Phantom Stake */}
        <motion.div
          className="mb-16 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🤔 What Is Phantom Stake?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-blue-300 mb-3">Like a Bank</h3>
              <p className="text-gray-300">You put money in, we give you daily interest. But much better rates than any bank!</p>
            </div>
            <div className="bg-black/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-green-300 mb-3">Your Money is Safe</h3>
              <p className="text-gray-300">Your original money is always protected. We never touch your principal investment.</p>
            </div>
            <div className="bg-black/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">Easy to Use</h3>
              <p className="text-gray-300">Just connect your wallet, deposit money, and watch it grow every day. No complicated stuff!</p>
            </div>
          </div>
        </motion.div>

        {/* How We Make Money */}
        <motion.div
          className="mb-16 bg-gray-900/50 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">💼 How We Generate Your Returns</h2>
          <p className="text-gray-400 text-center mb-8 text-lg">
            You might wonder: "How can Phantom Stake afford to pay 0.75% daily returns?" 
            <br />Here's exactly how our professional trading team makes money in the crypto markets:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Arbitrage Trading */}
            <div className="bg-black/20 rounded-lg p-6 border border-blue-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="text-2xl font-bold text-blue-300">Arbitrage Trading</h3>
                <p className="text-gray-400">Buy low on one exchange, sell high on another</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Real Example:</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Bitcoin price on Binance: $43,500</p>
                    <p>• Bitcoin price on Coinbase: $43,650</p>
                    <p>• <span className="text-green-300">Profit per Bitcoin: $150 (0.34%)</span></p>
                    <p>• With $1M trade: <span className="text-green-300">$3,400 profit in minutes</span></p>
                  </div>
                </div>
                
                <div className="bg-blue-800/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm font-semibold">
                    Our AI bots find 50-100 opportunities daily across 20+ exchanges
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-Chain Bridging */}
            <div className="bg-black/20 rounded-lg p-6 border border-green-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🌉</div>
                <h3 className="text-2xl font-bold text-green-300">Cross-Chain Bridging</h3>
                <p className="text-gray-400">Move crypto between blockchains for profit</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-900/30 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Real Example:</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• USDT on Ethereum: $1.000</p>
                    <p>• USDT on Polygon: $1.008</p>
                    <p>• Bridge 1M USDT → <span className="text-green-300">$8,000 profit</span></p>
                    <p>• Bridge fees: $2,000 → <span className="text-green-300">Net $6,000 (0.6%)</span></p>
                  </div>
                </div>
                
                <div className="bg-green-800/30 rounded-lg p-3">
                  <p className="text-green-300 text-sm font-semibold">
                    We bridge $10-50M daily across Ethereum, BSC, Polygon, Arbitrum
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DeFi Yield Farming */}
            <div className="bg-black/20 rounded-lg p-6 border border-purple-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🚜</div>
                <h3 className="text-2xl font-bold text-purple-300">DeFi Yield Farming</h3>
                <p className="text-gray-400">Earn rewards from liquidity pools</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Real Example:</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Provide $2M to USDT-USDC pool</p>
                    <p>• Pool APY: 15% annually (0.041% daily)</p>
                    <p>• Plus bonus tokens: +20% APY</p>
                    <p>• <span className="text-green-300">Total: 35% APY (0.096% daily)</span></p>
                  </div>
                </div>
                
                <div className="bg-purple-800/30 rounded-lg p-3">
                  <p className="text-purple-300 text-sm font-semibold">
                    We farm across 15+ protocols: Uniswap, PancakeSwap, Curve, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* MEV & Flash Loans */}
            <div className="bg-black/20 rounded-lg p-6 border border-yellow-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="text-2xl font-bold text-yellow-300">MEV & Flash Loans</h3>
                <p className="text-gray-400">Advanced trading strategies</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Real Example:</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Flash loan: Borrow $5M instantly</p>
                    <p>• Buy token on DEX A, sell on DEX B</p>
                    <p>• Repay loan + $25,000 profit</p>
                    <p>• <span className="text-green-300">All in one transaction (0.5% profit)</span></p>
                  </div>
                </div>
                
                <div className="bg-yellow-800/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm font-semibold">
                    Our MEV bots execute 200+ profitable trades daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Profit Breakdown */}
        <motion.div
          className="mb-16 bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📊 Our Daily Profit Breakdown</h2>
          <p className="text-gray-400 text-center mb-8">
            Here's how our $50 million trading fund generates daily profits:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/20 rounded-lg p-6 text-center border border-blue-500/30">
              <h4 className="text-blue-300 font-bold mb-2">Arbitrage</h4>
              <div className="text-2xl font-bold text-white mb-1">$180,000</div>
              <p className="text-gray-400 text-sm">0.36% daily profit</p>
              <p className="text-blue-300 text-xs">50-100 trades/day</p>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-green-500/30">
              <h4 className="text-green-300 font-bold mb-2">Bridging</h4>
              <div className="text-2xl font-bold text-white mb-1">$150,000</div>
              <p className="text-gray-400 text-sm">0.30% daily profit</p>
              <p className="text-green-300 text-xs">$25M moved daily</p>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <h4 className="text-purple-300 font-bold mb-2">DeFi Farming</h4>
              <div className="text-2xl font-bold text-white mb-1">$120,000</div>
              <p className="text-gray-400 text-sm">0.24% daily profit</p>
              <p className="text-purple-300 text-xs">15 protocols</p>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-yellow-500/30">
              <h4 className="text-yellow-300 font-bold mb-2">MEV Trading</h4>
              <div className="text-2xl font-bold text-white mb-1">$100,000</div>
              <p className="text-gray-400 text-sm">0.20% daily profit</p>
              <p className="text-yellow-300 text-xs">200+ trades/day</p>
            </div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6">
            <h3 className="text-yellow-300 font-bold text-center mb-4">💰 Total Daily Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">$550,000</div>
                <p className="text-gray-300 text-sm">Total Daily Profit</p>
                <p className="text-yellow-300 text-xs">1.1% of $50M fund</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">$375,000</div>
                <p className="text-gray-300 text-sm">Paid to Investors (0.75%)</p>
                <p className="text-green-300 text-xs">68% to investors</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">$175,000</div>
                <p className="text-gray-300 text-sm">Company Profit</p>
                <p className="text-blue-300 text-xs">32% for operations</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-blue-300 font-bold text-center mb-3">🔍 Why This Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p><span className="font-semibold text-white">Scale Advantage:</span> $50M allows us to capture opportunities too small for bigger funds</p>
              </div>
              <div>
                <p><span className="font-semibold text-white">Speed:</span> Our AI bots execute trades in milliseconds</p>
              </div>
              <div>
                <p><span className="font-semibold text-white">Diversification:</span> Multiple strategies reduce risk</p>
              </div>
              <div>
                <p><span className="font-semibold text-white">24/7 Operation:</span> Crypto markets never sleep, neither do our bots</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step by Step Process */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📋 Step-by-Step Process</h2>
          
          {/* Step Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeStep === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {step.icon} Step {index + 1}
              </button>
            ))}
          </div>

          {/* Active Step Content */}
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{steps[activeStep].icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{steps[activeStep].title}</h3>
              <p className="text-gray-400 text-lg">{steps[activeStep].description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps[activeStep].details.map((detail, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 border border-gray-600">
                  <p className="text-gray-300">• {detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two Wallet System */}
        <motion.div
          className="mb-16 bg-gray-900/50 border border-yellow-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">👛 Two Wallet System (Very Important!)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Principal Wallet */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="text-2xl font-bold text-blue-300">Principal Wallet</h3>
                <p className="text-gray-400">Your Original Investment</p>
              </div>
              
              <div className="space-y-3 text-gray-300">
                <p>• <span className="font-semibold">What it is:</span> Your original USDT deposit</p>
                <p>• <span className="font-semibold">Safety:</span> 100% protected, never lost</p>
                <p>• <span className="font-semibold">Lock time:</span> 6 months minimum</p>
                <p>• <span className="font-semibold">Purpose:</span> Generates your daily returns</p>
                <p>• <span className="font-semibold">Withdrawal:</span> Available after 6 months with 5% fee</p>
              </div>
              
              <div className="mt-4 bg-blue-800/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-semibold">
                  Example: You invest $1,000 → This $1,000 stays in Principal Wallet
                </p>
              </div>
            </div>

            {/* Income Wallet */}
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-2xl font-bold text-green-300">Income Wallet</h3>
                <p className="text-gray-400">Your Daily Earnings</p>
              </div>
              
              <div className="space-y-3 text-gray-300">
                <p>• <span className="font-semibold">What it is:</span> Daily returns from your investment</p>
                <p>• <span className="font-semibold">Rate:</span> 0.75% of your principal daily</p>
                <p>• <span className="font-semibold">Frequency:</span> Automatic every 24 hours</p>
                <p>• <span className="font-semibold">Withdrawal:</span> Anytime (minimum $1,000)</p>
                <p>• <span className="font-semibold">Fee:</span> 5% withdrawal fee</p>
              </div>
              
              <div className="mt-4 bg-green-800/30 rounded-lg p-3">
                <p className="text-green-300 text-sm font-semibold">
                  Example: $1,000 investment → $7.50 daily to Income Wallet
                </p>
              </div>
            </div>
          </div>

          {/* Example Timeline */}
          <div className="mt-8 bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6">
            <h4 className="text-yellow-300 font-bold text-center mb-4">📅 Example Timeline: $1,000 Investment</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-white">Day 1</div>
                <div className="text-gray-300">Principal: $1,000</div>
                <div className="text-green-300">Income: $7.50</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white">Day 30</div>
                <div className="text-gray-300">Principal: $1,000</div>
                <div className="text-green-300">Income: $225</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white">Day 180 (6 months)</div>
                <div className="text-gray-300">Principal: $1,000 (unlocked)</div>
                <div className="text-green-300">Income: $1,350</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white">Day 365 (1 year)</div>
                <div className="text-gray-300">Principal: $1,000</div>
                <div className="text-green-300">Income: $2,737</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Building Explained */}
        <motion.div
          className="mb-16 bg-gray-900/50 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">👥 Team Building (Optional but Profitable)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Direct Referrals */}
            <div className="bg-black/20 rounded-lg p-6 border border-blue-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-xl font-bold text-blue-300">Direct Referrals</h3>
              </div>
              
              <div className="space-y-3 text-gray-300 text-sm">
                <p>• Share your referral link</p>
                <p>• When someone joins with your link</p>
                <p>• You get 10% of their investment</p>
                <p>• Paid instantly to Income Wallet</p>
              </div>
              
              <div className="mt-4 bg-blue-900/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-semibold">
                  Friend invests $2,000 → You get $200
                </p>
              </div>
            </div>

            {/* Binary System */}
            <div className="bg-black/20 rounded-lg p-6 border border-green-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚖️</div>
                <h3 className="text-xl font-bold text-green-300">Binary System</h3>
              </div>
              
              <div className="space-y-3 text-gray-300 text-sm">
                <p>• You have Left Team and Right Team</p>
                <p>• When both sides balance</p>
                <p>• You create "matching pairs"</p>
                <p>• Earn 8-12% monthly bonuses</p>
              </div>
              
              <div className="mt-4 bg-green-900/30 rounded-lg p-3">
                <p className="text-green-300 text-sm font-semibold">
                  $10,000 each side → $800-1,200/month
                </p>
              </div>
            </div>

            {/* Leadership Ranks */}
            <div className="bg-black/20 rounded-lg p-6 border border-purple-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">👑</div>
                <h3 className="text-xl font-bold text-purple-300">Leadership Ranks</h3>
              </div>
              
              <div className="space-y-3 text-gray-300 text-sm">
                <p>• Bronze: $5,000 team volume</p>
                <p>• Silver: $50,000 team volume</p>
                <p>• Gold: $150,000 team volume</p>
                <p>• Diamond: $500,000 team volume</p>
              </div>
              
              <div className="mt-4 bg-purple-900/30 rounded-lg p-3">
                <p className="text-purple-300 text-sm font-semibold">
                  Higher rank → Bigger monthly bonuses
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fees and Rules */}
        <motion.div
          className="mb-16 bg-gray-900/50 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📋 Fees and Rules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fees */}
            <div>
              <h3 className="text-2xl font-bold text-red-300 mb-6">💸 Fees</h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4 border border-red-500/30">
                  <h4 className="text-white font-bold mb-2">Withdrawal Fee: 5%</h4>
                  <p className="text-gray-300 text-sm">Applied when you withdraw money from Income or Principal wallet</p>
                  <p className="text-red-300 text-sm">Example: Withdraw $1,000 → Fee $50 → You get $950</p>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-red-500/30">
                  <h4 className="text-white font-bold mb-2">Gas Fee: Minimum 5 USDT</h4>
                  <p className="text-gray-300 text-sm">Ethereum network fee for transactions</p>
                  <p className="text-red-300 text-sm">Paid automatically from your withdrawal</p>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div>
              <h3 className="text-2xl font-bold text-yellow-300 mb-6">📜 Important Rules</h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-white font-bold mb-2">Minimum Amounts</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Minimum deposit: $50 USDT</p>
                    <p>• Minimum withdrawal: $1,000 USDT</p>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-white font-bold mb-2">Lock Periods</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Principal locked: 6 months minimum</p>
                    <p>• Income wallet: No lock, withdraw anytime</p>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-white font-bold mb-2">Program Duration</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>• Program I: Aug 1, 2025 → Sep 30, 2026</p>
                    <p>• Total: 426 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simple Example */}
        <motion.div
          className="mb-16 bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📝 Complete Example: John's Journey</h2>
          
          <div className="space-y-6">
            {/* Day 1 */}
            <div className="bg-black/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-300 mb-4">Day 1: John Starts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold">Action:</p>
                  <p>John deposits $5,000 USDT</p>
                </div>
                <div>
                  <p className="font-semibold">Principal Wallet:</p>
                  <p>$5,000 (locked for 6 months)</p>
                </div>
                <div>
                  <p className="font-semibold">Income Wallet:</p>
                  <p>$0</p>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div className="bg-black/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Day 2: First Return</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold">Daily Return:</p>
                  <p>$5,000 × 0.75% = $37.50</p>
                </div>
                <div>
                  <p className="font-semibold">Principal Wallet:</p>
                  <p>$5,000 (unchanged)</p>
                </div>
                <div>
                  <p className="font-semibold">Income Wallet:</p>
                  <p>$37.50</p>
                </div>
              </div>
            </div>

            {/* Day 30 */}
            <div className="bg-black/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Day 30: One Month Later</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold">Monthly Income:</p>
                  <p>$37.50 × 30 = $1,125</p>
                </div>
                <div>
                  <p className="font-semibold">Principal Wallet:</p>
                  <p>$5,000 (still locked)</p>
                </div>
                <div>
                  <p className="font-semibold">Income Wallet:</p>
                  <p>$1,125 (can withdraw!)</p>
                </div>
              </div>
            </div>

            {/* Day 180 */}
            <div className="bg-black/20 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">Day 180: Principal Unlocked!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold">Total Income:</p>
                  <p>$37.50 × 180 = $6,750</p>
                </div>
                <div>
                  <p className="font-semibold">Principal Wallet:</p>
                  <p>$5,000 (now unlocked!)</p>
                </div>
                <div>
                  <p className="font-semibold">Total Value:</p>
                  <p>$11,750 (135% profit!)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="mb-16 bg-gray-900/50 border border-gray-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">❓ Common Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">Is my money safe?</h4>
                <p className="text-gray-300 text-sm">Yes! Your principal is always protected and never touched. Only the daily returns are distributed.</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">When can I withdraw?</h4>
                <p className="text-gray-300 text-sm">Income wallet: Anytime (min $1,000). Principal wallet: After 6 months.</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">Do I need to invite people?</h4>
                <p className="text-gray-300 text-sm">No! You can earn just from your investment. Team building is optional but gives extra income.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">What if I want to quit?</h4>
                <p className="text-gray-300 text-sm">You can withdraw your income anytime. Principal can be withdrawn after 6 months with 5% fee.</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">How do I get paid?</h4>
                <p className="text-gray-300 text-sm">Daily returns are automatic. Withdrawals are sent directly to your wallet within 24 hours.</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">What happens after 426 days?</h4>
                <p className="text-gray-300 text-sm">Program I ends. You can withdraw everything. Program II will start with new opportunities.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Ready to Start Your Journey?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PulsatingButton 
                pulseColor="#10b981"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-lg"
              >
                Join Program I (August 2025)
              </PulsatingButton>
              
              <ShimmerButton
                shimmerColor="#a855f7"
                background="rgba(139, 69, 219, 0.1)"
                borderRadius="8px"
                className="px-8 py-4 text-purple-400 border-purple-500/30 font-semibold text-lg"
              >
                Calculate Your Returns
              </ShimmerButton>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 