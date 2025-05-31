"use client";

import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  const currentPhase = {
    name: "Program I (Founders' Program)",
    status: "Starting Soon",
    date: "August 1, 2025",
    roi: "0.75% - 1.0% Daily ROI",
  };

  const upcomingPhases = [
    { name: "Program II", date: "Oct 1, 2026", roi: "0.80% - 1.05%" },
    { name: "Program III", date: "Oct 1, 2027", roi: "0.85% - 1.10%" },
    { name: "Program IV", date: "Oct 1, 2028", roi: "0.90% - 1.15%" },
  ];

  return (
    <motion.footer 
      className="bg-black border-t border-purple-500/20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Phase Timeline Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <TextAnimate 
              animation="blurInUp" 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Phantom Stake Program Timeline
            </TextAnimate>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Four independent staking programs, each with their own timeframe and rewards structure
            </p>
          </div>

          {/* Current Phase Highlight */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 mb-8 border border-purple-500/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-semibold text-sm">{currentPhase.status}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{currentPhase.name}</h3>
              <p className="text-purple-300 mb-2">{currentPhase.date}</p>
              <p className="text-gray-300 text-sm">{currentPhase.roi}</p>
              <div className="mt-4">
                <ShimmerButton
                  shimmerColor="#ec4899"
                  background="rgba(236, 72, 153, 0.1)"
                  borderRadius="8px"
                  className="text-sm px-6 py-2 border-pink-500/30"
                >
                  Get Ready for Launch
                </ShimmerButton>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Phases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingPhases.map((phase, index) => (
              <motion.div
                key={phase.name}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ borderColor: "rgba(139, 92, 246, 0.5)" }}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-white mb-1">{phase.name}</h4>
                  <p className="text-gray-400 text-sm mb-1">{phase.date}</p>
                  <p className="text-purple-300 text-xs">{phase.roi} Daily</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Phantom Stake
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Decentralized staking platform with up to 1% daily returns through innovative MLM programs on Ethereum.
            </p>
            <div className="flex space-x-3">
              {[
                { name: "twitter", icon: "𝕏", url: "#twitter" },
                { name: "telegram", icon: "✈️", url: "#telegram" },
                { name: "discord", icon: "🎮", url: "#discord" }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.name.charAt(0).toUpperCase() + social.name.slice(1)}
                >
                  <span className="text-sm">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <div className="space-y-2">
              {["Dashboard", "Calculator", "Programs", "Referrals"].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <div className="space-y-2">
              {["How It Works", "FAQ", "Terms", "Privacy"].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-800 mt-4">
                <p className="text-gray-400 text-xs mb-2">Contact Us:</p>
                <a 
                  href="mailto:support@phantomwallet.com" 
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  support@phantomwallet.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get notified about Program I launch and updates.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors duration-200"
              />
              <ShimmerButton
                shimmerColor="#a855f7"
                background="rgba(139, 69, 219, 0.1)"
                borderRadius="8px"
                className="w-full text-sm py-2 border-purple-500/30"
              >
                Subscribe
              </ShimmerButton>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Phantom Stake. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-400">Network:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-400">Ethereum Mainnet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400">USDT (ERC-20)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 