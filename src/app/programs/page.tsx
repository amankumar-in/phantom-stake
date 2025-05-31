"use client";

import { useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(0);

  const programs = [
    {
      id: "I",
      name: "Founders' Program",
      period: "Aug 1, 2025 → Sep 30, 2026",
      duration: "426 days",
      status: "available-soon",
      baseROI: "0.75%",
      enhancedROI: "0.85%",
      maxROI: "1.0%",
      compoundTrigger: "7 days",
      minInvestment: "50 USDT",
      enhancedRequirement: "≥5,000 USDT + 1 referral ≥1,000 USDT",
      compoundRequirement: "≥50 USDT income wallet, no withdrawals for 7 days",
      directBonus: "10%",
      matchingBonus: "8% - 12%",
      levelOverrides: "5%, 2%, 1%, 0.5%, 0.25%",
      leadershipPools: "0.5% - 2.0%",
      features: [
        "Exclusive founder benefits",
        "Highest priority support",
        "Legacy status recognition",
        "Early access advantages"
      ],
      milestones: [
        { pairs: 100, reward: "500 USDT + iPad" },
        { pairs: 250, reward: "1,500 USDT + MacBook Pro" },
        { pairs: 500, reward: "5,000 USDT + Tesla Model 3" },
        { pairs: 1000, reward: "10,000 USDT + Luxury Villa" }
      ]
    },
    {
      id: "II",
      name: "Growth Program",
      period: "Oct 1, 2026 → Sep 30, 2027",
      duration: "365 days",
      status: "future",
      baseROI: "0.80%",
      enhancedROI: "0.90%",
      maxROI: "1.05%",
      compoundTrigger: "5 days",
      minInvestment: "50 USDT",
      enhancedRequirement: "≥7,500 USDT + 2 referrals ≥1,500 USDT each",
      compoundRequirement: "≥100 USDT income wallet, no withdrawals for 5 days",
      directBonus: "10%",
      matchingBonus: "9% - 13%",
      levelOverrides: "6%, 3%, 1.5%, 1.0%, 0.5%",
      leadershipPools: "0.75% - 2.25%",
      features: [
        "Enhanced reward structures",
        "Improved matching percentages",
        "Growing community benefits",
        "Advanced staking features"
      ],
      milestones: [
        { pairs: 250, reward: "2,000 USDT + MacBook Air" },
        { pairs: 500, reward: "5,000 USDT + Tesla Model 3" },
        { pairs: 1000, reward: "10,000 USDT + Luxury Villa" },
        { pairs: 2500, reward: "25,000 USDT + Private Island" }
      ]
    },
    {
      id: "III",
      name: "Elite Program",
      period: "Oct 1, 2027 → Sep 30, 2028",
      duration: "365 days",
      status: "future",
      baseROI: "0.90%",
      enhancedROI: "1.00%",
      maxROI: "1.10%",
      compoundTrigger: "3 days",
      minInvestment: "50 USDT",
      enhancedRequirement: "≥10,000 USDT + 3 referrals ≥2,000 USDT each",
      compoundRequirement: "≥200 USDT income wallet, no withdrawals for 3 days",
      directBonus: "12%",
      matchingBonus: "10% - 14%",
      levelOverrides: "7%, 4%, 2%, 1.5%, 1.0%",
      leadershipPools: "1.0% - 2.5%",
      features: [
        "Premium tier access",
        "Elite reward mechanisms",
        "Advanced compounding",
        "Exclusive elite community"
      ],
      milestones: [
        { pairs: 200, reward: "2,500 USDT + MacBook Pro" },
        { pairs: 500, reward: "10,000 USDT + Tesla Model S" },
        { pairs: 1000, reward: "20,000 USDT + Luxury Penthouse" },
        { pairs: 2000, reward: "50,000 USDT + Private Jet" }
      ]
    },
    {
      id: "IV",
      name: "Legacy Program",
      period: "Oct 1, 2028 → Ongoing",
      duration: "Indefinite",
      status: "future",
      baseROI: "1.00%",
      enhancedROI: "1.10%",
      maxROI: "1.15%",
      compoundTrigger: "1 day",
      minInvestment: "100 USDT",
      enhancedRequirement: "≥15,000 USDT + 5 referrals ≥3,000 USDT each",
      compoundRequirement: "≥500 USDT income wallet, no withdrawals for 1 day",
      directBonus: "15%",
      matchingBonus: "12% - 16%",
      levelOverrides: "8%, 5%, 3%, 2%, 1.0%",
      leadershipPools: "1.5% - 3.0%",
      features: [
        "DAO governance participation",
        "Maximum return potential",
        "Long-term sustainability",
        "Community-driven decisions"
      ],
      milestones: [
        { pairs: 1000, reward: "25,000 USDT + Luxury Villa" },
        { pairs: 2500, reward: "50,000 USDT + Private Jet" },
        { pairs: 5000, reward: "100,000 USDT + Mega Villa" },
        { pairs: 10000, reward: "250,000 USDT + Private Island" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available-soon":
        return "from-green-900/50 to-purple-900/50 border-green-500/50";
      case "future":
        return "from-gray-900/50 to-gray-800/50 border-gray-600/30";
      default:
        return "from-gray-900/50 to-gray-800/50 border-gray-600/30";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "available-soon":
        return (
          <>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 font-semibold text-sm">Available Soon</span>
          </>
        );
      case "future":
        return (
          <>
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            <span className="text-gray-500 font-semibold text-sm">Future Phase</span>
          </>
        );
      default:
        return null;
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
            Programs Overview
          </TextAnimate>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Four sequential staking programs, each designed to provide escalating rewards and features. 
            Currently, only <span className="text-green-400 font-semibold">Program I (Founders)</span> is available for registration.
          </p>
        </motion.div>

        {/* Program Timeline Visual */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Program Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {programs.map((program, index) => (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedProgram === index 
                      ? getStatusColor(program.status) + " scale-105" 
                      : "bg-gray-800/50 border-gray-600/30 hover:border-purple-500/50"
                  }`}
                  onClick={() => setSelectedProgram(index)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIndicator(program.status)}
                  </div>
                  <h4 className={`font-bold mb-1 ${
                    program.status === 'available-soon' ? 'text-white' : 'text-gray-400'
                  }`}>
                    Program {program.id}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    program.status === 'available-soon' ? 'text-purple-300' : 'text-gray-500'
                  }`}>
                    {program.name}
                  </p>
                  <p className={`text-xs ${
                    program.status === 'available-soon' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {program.baseROI} - {program.maxROI} daily
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Selected Program Details */}
        <motion.div
          key={selectedProgram}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-gradient-to-br ${getStatusColor(programs[selectedProgram].status)} rounded-xl p-8 backdrop-blur-sm mb-12`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Program Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIndicator(programs[selectedProgram].status)}
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${
                programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
              }`}>
                Program {programs[selectedProgram].id}: {programs[selectedProgram].name}
              </h2>
              
              <p className={`text-lg mb-4 ${
                programs[selectedProgram].status === 'available-soon' ? 'text-purple-300' : 'text-gray-500'
              }`}>
                {programs[selectedProgram].period}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`bg-black/20 rounded-lg p-4 ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-green-500/30' : 'border border-gray-600/30'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
                  }`}>Base ROI</h4>
                  <p className={`text-2xl font-bold ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {programs[selectedProgram].baseROI}
                  </p>
                  <p className={`text-sm ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>per day</p>
                </div>

                <div className={`bg-black/20 rounded-lg p-4 ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-purple-500/30' : 'border border-gray-600/30'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
                  }`}>Max ROI</h4>
                  <p className={`text-2xl font-bold ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-purple-400' : 'text-gray-500'
                  }`}>
                    {programs[selectedProgram].maxROI}
                  </p>
                  <p className={`text-sm ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>with compounding</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className={`font-semibold ${
                  programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
                }`}>Key Features:</h4>
                <ul className="space-y-2">
                  {programs[selectedProgram].features.map((feature, index) => (
                    <li key={index} className={`flex items-center space-x-2 ${
                      programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        programs[selectedProgram].status === 'available-soon' ? 'bg-green-400' : 'bg-gray-500'
                      }`}></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3 className={`text-xl font-bold mb-4 ${
                programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
              }`}>Technical Details</h3>
              
              <div className="space-y-4">
                <div className={`bg-black/20 rounded-lg p-4 ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-blue-500/30' : 'border border-gray-600/30'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-blue-300' : 'text-gray-500'
                  }`}>Investment Requirements</h4>
                  <p className={`text-sm mb-1 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Minimum:</span> {programs[selectedProgram].minInvestment}
                  </p>
                  <p className={`text-sm ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Enhanced ROI:</span> {programs[selectedProgram].enhancedRequirement}
                  </p>
                </div>

                <div className={`bg-black/20 rounded-lg p-4 ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-yellow-500/30' : 'border border-gray-600/30'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-yellow-300' : 'text-gray-500'
                  }`}>Compounding</h4>
                  <p className={`text-sm mb-1 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Trigger:</span> {programs[selectedProgram].compoundTrigger} no withdrawals
                  </p>
                  <p className={`text-sm ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Requirement:</span> {programs[selectedProgram].compoundRequirement}
                  </p>
                </div>

                <div className={`bg-black/20 rounded-lg p-4 ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-green-500/30' : 'border border-gray-600/30'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-green-300' : 'text-gray-500'
                  }`}>MLM Structure</h4>
                  <p className={`text-sm mb-1 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Direct Bonus:</span> {programs[selectedProgram].directBonus}
                  </p>
                  <p className={`text-sm mb-1 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Matching:</span> {programs[selectedProgram].matchingBonus}
                  </p>
                  <p className={`text-sm ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">Level Overrides:</span> {programs[selectedProgram].levelOverrides}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Rewards */}
          <div className="mt-8">
            <h3 className={`text-xl font-bold mb-4 ${
              programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-400'
            }`}>Lifetime Milestone Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {programs[selectedProgram].milestones.map((milestone, index) => (
                <div key={index} className={`bg-black/20 rounded-lg p-4 text-center ${
                  programs[selectedProgram].status === 'available-soon' ? 'border border-purple-500/30' : 'border border-gray-600/30'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-purple-300' : 'text-gray-500'
                  }`}>
                    {milestone.pairs}
                  </div>
                  <div className={`text-xs mb-2 ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    matching pairs
                  </div>
                  <div className={`text-sm font-medium ${
                    programs[selectedProgram].status === 'available-soon' ? 'text-white' : 'text-gray-500'
                  }`}>
                    {milestone.reward}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {programs[selectedProgram].status === 'available-soon' ? (
              <>
                <PulsatingButton 
                  pulseColor="#10b981"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg py-4"
                >
                  Get Ready for Program {programs[selectedProgram].id}
                </PulsatingButton>
                <ShimmerButton
                  shimmerColor="#a855f7"
                  background="rgba(139, 69, 219, 0.1)"
                  borderRadius="8px"
                  className="flex-1 text-purple-400 border-purple-500/30 py-4"
                >
                  Calculate ROI
                </ShimmerButton>
              </>
            ) : (
              <div className="flex-1 bg-gray-800/50 border border-gray-600/30 rounded-lg py-4 px-6 text-center">
                <span className="text-gray-500">Available in {programs[selectedProgram].period.split(' → ')[0]}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Key Differentiators */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-3">Capital Protection</h3>
            <p className="text-gray-300 text-sm">
              Your principal is always preserved in a separate wallet, locked for minimum 6 months to prevent panic selling.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-3">Escalating Returns</h3>
            <p className="text-gray-300 text-sm">
              Each program offers higher ROI potential than the previous, with Program IV reaching up to 1.15% daily.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-3">Exclusive Benefits</h3>
            <p className="text-gray-300 text-sm">
              Early program participants receive exclusive benefits, milestone rewards, and priority access to future features.
            </p>
          </div>
        </motion.div>

        {/* Important Information */}
        <motion.div
          className="bg-gray-900/50 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-yellow-300 mb-4">Important Program Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Current Availability</h4>
              <ul className="space-y-1">
                <li>• Only Program I is currently accepting registrations</li>
                <li>• Program I launches August 1, 2025</li>
                <li>• Future programs open sequentially</li>
                <li>• Each program is completely independent</li>
                <li>• Principal always preserved across all programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Investment Structure</h4>
              <ul className="space-y-1">
                <li>• Principal wallet: locked for 6+ months</li>
                <li>• Income wallet: withdrawable anytime (min $1,000)</li>
                <li>• Ethereum network (ERC-20 USDT)</li>
                <li>• 5% withdrawal fee + gas costs</li>
                <li>• Money typically doubles by 6 months</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 