"use client";

import { useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

export default function Calculator() {
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [timeframe, setTimeframe] = useState(30);

  // Simple calculation
  const dailyReturn = (investmentAmount * 0.75) / 100;
  const totalReturn = dailyReturn * timeframe;
  const totalValue = investmentAmount + totalReturn;

  const calculateReturns = () => {
    if (investmentAmount < 500) {
      alert('Minimum investment is $500');
      return;
    }
  };

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
            Simple Income Calculator
          </TextAnimate>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            See exactly how much money you can make with Phantom Stake.
            <br />Program I starts <span className="text-green-400 font-semibold">August 1, 2025</span>.
          </p>
        </motion.div>

        {/* How It Works - Simple */}
        <motion.div
          className="mb-12 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">💡 How You Make Money</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/20 rounded-lg p-6 text-center border border-green-500/30">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-green-300 mb-3">Daily Returns</h3>
              <p className="text-gray-300 text-lg">Get 0.75% of your money back every day</p>
              <p className="text-green-400 text-sm mt-2">Example: $1,000 → $7.50 daily</p>
            </div>
            <div className="bg-black/20 rounded-lg p-6 text-center border border-blue-500/30">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-blue-300 mb-3">Invite Friends</h3>
              <p className="text-gray-300 text-lg">Get 10% when someone joins with your link</p>
              <p className="text-blue-400 text-sm mt-2">Example: Friend invests $1,000 → You get $100</p>
            </div>
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">Team Bonuses</h3>
              <p className="text-gray-300 text-lg">Earn extra money from your team's success</p>
              <p className="text-purple-400 text-sm mt-2">Build a team → Earn 8-12% monthly bonuses</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Investment Amount */}
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">💰 How Much Will You Invest?</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-lg font-medium mb-3">
                    Investment Amount (Minimum: $500)
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-purple-500"
                    placeholder="1000"
                  />
                  <p className="text-gray-400 mt-2">This money stays safe. You can get it back after 6 months.</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-lg font-medium mb-3">
                    How Long Do You Want to Calculate?
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value={7}>1 Week</option>
                    <option value={30}>1 Month</option>
                    <option value={90}>3 Months</option>
                    <option value={180}>6 Months</option>
                    <option value={365}>1 Year</option>
                  </select>
                </div>
              </div>

              {/* Quick Examples */}
              <div className="mt-6">
                <h4 className="text-white font-bold mb-3">Quick Examples:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInvestmentAmount(500)}
                    className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="text-white font-bold">$500</div>
                    <div className="text-gray-400 text-sm">Beginner</div>
                  </button>
                  <button
                    onClick={() => setInvestmentAmount(1000)}
                    className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="text-white font-bold">$1,000</div>
                    <div className="text-gray-400 text-sm">Popular</div>
                  </button>
                  <button
                    onClick={() => setInvestmentAmount(5000)}
                    className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="text-white font-bold">$5,000</div>
                    <div className="text-gray-400 text-sm">Professional</div>
                  </button>
                  <button
                    onClick={() => setInvestmentAmount(10000)}
                    className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="text-white font-bold">$10,000</div>
                    <div className="text-gray-400 text-sm">Elite</div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Daily Income */}
            <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">💵 Your Daily Income</h3>
              
              <div className="bg-black/20 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-300 mb-2">
                  ${dailyReturn.toFixed(2)}
                </div>
                <p className="text-gray-300 text-lg">Every single day</p>
                <p className="text-gray-400 text-sm mt-2">
                  ${investmentAmount.toLocaleString()} × 0.75% = ${dailyReturn.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 text-center">
                  ✅ This money goes to your Income Wallet and you can withdraw it anytime!
                </p>
              </div>
            </div>

            {/* Total Results */}
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">📊 After {timeframe} Days</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-blue-300">${investmentAmount.toLocaleString()}</div>
                    <p className="text-gray-400 text-sm">Your Original Money (Safe)</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-300">${totalReturn.toFixed(0)}</div>
                    <p className="text-gray-400 text-sm">Income Earned</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">${totalValue.toFixed(0)}</div>
                    <p className="text-gray-300 text-lg">Total Money You Have</p>
                    <p className="text-green-300 text-sm mt-2">
                      Profit: ${totalReturn.toFixed(0)} ({((totalReturn / investmentAmount) * 100).toFixed(1)}% gain)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Simple Examples */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📝 Real Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Example 1 */}
            <div className="bg-black/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-300 mb-4">Small Start: $500</h3>
              <div className="space-y-3 text-gray-300">
                <p>• <span className="font-semibold">You invest:</span> $500</p>
                <p>• <span className="font-semibold">Daily income:</span> $3.75</p>
                <p>• <span className="font-semibold">Monthly income:</span> $112.50</p>
                <p>• <span className="font-semibold">After 6 months:</span> $1,175</p>
                <p className="text-green-300 font-semibold">Profit: $675 (135%)</p>
              </div>
            </div>

            {/* Example 2 */}
            <div className="bg-black/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Popular: $1,000</h3>
              <div className="space-y-3 text-gray-300">
                <p>• <span className="font-semibold">You invest:</span> $1,000</p>
                <p>• <span className="font-semibold">Daily income:</span> $7.50</p>
                <p>• <span className="font-semibold">Monthly income:</span> $225</p>
                <p>• <span className="font-semibold">After 6 months:</span> $2,350</p>
                <p className="text-blue-300 font-semibold">Profit: $1,350 (135%)</p>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-black/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Big Player: $10,000</h3>
              <div className="space-y-3 text-gray-300">
                <p>• <span className="font-semibold">You invest:</span> $10,000</p>
                <p>• <span className="font-semibold">Daily income:</span> $75</p>
                <p>• <span className="font-semibold">Monthly income:</span> $2,250</p>
                <p>• <span className="font-semibold">After 6 months:</span> $23,500</p>
                <p className="text-purple-300 font-semibold">Profit: $13,500 (135%)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Building Benefits */}
        <motion.div
          className="mt-16 bg-gray-900/50 border border-yellow-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🚀 Make Even More Money</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Referral Bonuses */}
            <div>
              <h3 className="text-2xl font-bold text-yellow-300 mb-6">👥 Invite Friends</h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">How it works:</h4>
                  <p className="text-gray-300">When someone joins with your link, you get 10% of their investment immediately.</p>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-300 font-bold mb-2">Example:</h4>
                  <div className="text-gray-300 space-y-1">
                    <p>• Friend 1 invests $1,000 → You get $100</p>
                    <p>• Friend 2 invests $2,000 → You get $200</p>
                    <p>• Friend 3 invests $500 → You get $50</p>
                    <p className="text-yellow-300 font-bold">Total bonus: $350 (instant!)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Bonuses */}
            <div>
              <h3 className="text-2xl font-bold text-blue-300 mb-6">🏆 Team Bonuses</h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">How it works:</h4>
                  <p className="text-gray-300">When your team grows, you earn monthly bonuses from their activity.</p>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-bold mb-2">Ranks & Bonuses:</h4>
                  <div className="text-gray-300 space-y-1 text-sm">
                    <p>• Bronze: $5,000 team → $50/month</p>
                    <p>• Silver: $50,000 team → $1,000/month</p>
                    <p>• Gold: $150,000 team → $4,500/month</p>
                    <p>• Diamond: $500,000 team → $20,000/month</p>
                    <p className="text-blue-300 font-bold">Build bigger team = Bigger bonuses!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Free Gifts */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🎁 Achievement Rewards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-300 mb-2">100</div>
              <div className="text-sm text-gray-400 mb-3">Balance Points</div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-white">$500 Cash</div>
                <div className="text-purple-300 font-semibold">+ iPad</div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-300 mb-2">250</div>
              <div className="text-sm text-gray-400 mb-3">Balance Points</div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-white">$1,500 Cash</div>
                <div className="text-purple-300 font-semibold">+ MacBook Pro</div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-300 mb-2">500</div>
              <div className="text-sm text-gray-400 mb-3">Balance Points</div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-white">$5,000 Cash</div>
                <div className="text-purple-300 font-semibold">+ Tesla Model 3</div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 text-center border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-300 mb-2">1,000</div>
              <div className="text-sm text-gray-400 mb-3">Balance Points</div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-white">$10,000 Cash</div>
                <div className="text-purple-300 font-semibold">+ Luxury Villa</div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-blue-300 font-bold text-center mb-3">💡 How to Earn Balance Points</h4>
            <p className="text-gray-300 text-center mb-3">
              When you build a team, you have people on your left side and right side. When both sides grow equally, you earn points!
            </p>
            <div className="bg-black/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-white text-center">
                <strong>Example:</strong> Left team has $1,000 volume, Right team has $1,000 volume = You earn 1 balance point
              </p>
            </div>
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          className="mt-16 bg-gray-900/50 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">⚠️ Important Things to Know</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-green-300 mb-4">✅ Good News</h3>
              <div className="space-y-3 text-gray-300">
                <p>• Your original money is always safe</p>
                <p>• You can withdraw income anytime (minimum $1,000)</p>
                <p>• Daily returns are automatic</p>
                <p>• No hidden fees on daily returns</p>
                <p>• Program runs for 426 days (until Sep 30, 2026)</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-red-300 mb-4">⚠️ Rules to Remember</h3>
              <div className="space-y-3 text-gray-300">
                <p>• Your original investment is locked for 6 months minimum</p>
                <p>• 5% fee when you withdraw money</p>
                <p>• Minimum withdrawal is $1,000</p>
                <p>• Program starts August 1, 2025 (not yet!)</p>
                <p>• All investments have risk</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Ready to Start Making Money?</h2>
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
                Learn How It Works
              </ShimmerButton>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 