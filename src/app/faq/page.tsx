"use client";

import { useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: "what-is-phantom-stake",
    question: "What is Phantom Stake?",
    answer: "Phantom Stake is a professional arbitrage trading platform that generates daily returns through automated DeFi strategies including cross-exchange arbitrage, cross-chain bridging, yield farming, and MEV trading. We operate a $50M+ trading fund and share 68% of profits with investors.",
    category: "Getting Started"
  },
  {
    id: "how-to-start",
    question: "How do I get started?",
    answer: "Simply connect your Ethereum wallet (MetaMask recommended), deposit USDT (minimum $50), and start earning 0.75%-1.0% daily returns immediately. Program I launches August 1, 2025.",
    category: "Getting Started"
  },
  {
    id: "minimum-investment",
    question: "What&apos;s the minimum investment?",
    answer: "The minimum investment is $50 USDT. This makes our platform accessible to beginners while still allowing for significant growth potential.",
    category: "Getting Started"
  },
  {
    id: "when-launch",
    question: "When does Program I launch?",
    answer: "Program I (Founders&apos; Program) launches on August 1, 2025 and runs until September 30, 2026 (426 days total). This is an exclusive early access program with special founder benefits.",
    category: "Getting Started"
  },

  // Investment & Returns
  {
    id: "dual-wallet-system",
    question: "How does the dual-wallet system work?",
    answer: "Your investment is split into two wallets: (1) Principal Wallet - holds your original USDT investment, 100% protected and locked for 6 months minimum. (2) Income Wallet - receives your daily returns (0.75% of principal), withdrawable anytime with $1,000 minimum.",
    category: "Investment & Returns"
  },
  {
    id: "daily-returns",
    question: "How much can I earn daily?",
    answer: "You earn 0.75%-1.0% of your principal investment daily. For example: $1,000 investment = $7.50 daily ($225 monthly), $5,000 investment = $37.50 daily ($1,125 monthly). Returns are paid automatically to your Income Wallet.",
    category: "Investment & Returns"
  },
  {
    id: "principal-safety",
    question: "Is my principal investment safe?",
    answer: "Yes, your principal is 100% protected. It&apos;s never used for trading and remains in your Principal Wallet. We generate returns from our separate $50M trading fund through arbitrage and DeFi strategies. Your principal can be withdrawn after the 6-month lock period.",
    category: "Investment & Returns"
  },
  {
    id: "how-profits-generated",
    question: "How do you generate such high returns?",
    answer: "Our professional trading team uses multiple strategies: Arbitrage Trading ($180K daily), Cross-Chain Bridging ($150K daily), DeFi Yield Farming ($120K daily), and MEV Trading ($100K daily). Total daily profits: $550K, with 68% ($375K) shared with investors.",
    category: "Investment & Returns"
  },

  // Withdrawals & Fees
  {
    id: "withdraw-income",
    question: "When can I withdraw my income?",
    answer: "You can withdraw from your Income Wallet anytime with a minimum of $1,000 USDT. Withdrawals are processed within 24 hours. There&apos;s a 5% withdrawal fee plus 5 USDT gas fee.",
    category: "Withdrawals & Fees"
  },
  {
    id: "withdraw-principal",
    question: "When can I withdraw my principal?",
    answer: "Your principal is locked for a minimum of 6 months for program stability. After this period, you can withdraw your full principal with a 5% withdrawal fee. The lock period ensures consistent returns for all participants.",
    category: "Withdrawals & Fees"
  },
  {
    id: "withdrawal-fees",
    question: "What are the withdrawal fees?",
    answer: "There&apos;s a 5% withdrawal fee on all withdrawals (both income and principal) plus a 5 USDT gas fee for Ethereum network transactions. These fees help maintain platform operations and security.",
    category: "Withdrawals & Fees"
  },
  {
    id: "withdrawal-limits",
    question: "Are there withdrawal limits?",
    answer: "Minimum withdrawal is $1,000 USDT from your Income Wallet. There&apos;s no maximum limit. Principal withdrawals require the 6-month lock period to be completed first.",
    category: "Withdrawals & Fees"
  },

  // Team Building & Bonuses
  {
    id: "referral-program",
    question: "How does the referral program work?",
    answer: "Earn 10% of any investment made through your referral link, paid instantly to your Income Wallet. For example, if your friend invests $2,000, you receive $200 immediately. There&apos;s no limit to referral earnings.",
    category: "Team Building & Bonuses"
  },
  {
    id: "team-bonuses",
    question: "What are team bonuses?",
    answer: "Build teams on your left and right sides to earn monthly bonuses: Bronze ($5K team) = $50/month, Silver ($50K team) = $1,000/month, Gold ($150K team) = $4,500/month, Diamond ($500K team) = $20,000/month.",
    category: "Team Building & Bonuses"
  },
  {
    id: "team-optional",
    question: "Do I need to build a team to earn?",
    answer: "No! You earn daily returns from your investment without any team building. The referral and team programs are optional ways to earn additional income on top of your daily returns.",
    category: "Team Building & Bonuses"
  },
  {
    id: "milestone-rewards",
    question: "What are the milestone rewards?",
    answer: "Achieve team milestones to win: 100 pairs = $500 + iPad, 250 pairs = $1,500 + MacBook Pro, 500 pairs = $5,000 + Tesla Model 3, 1,000 pairs = $10,000 + Luxury Villa. Pairs are created when both your left and right teams balance.",
    category: "Team Building & Bonuses"
  },

  // Technical & Security
  {
    id: "which-blockchain",
    question: "Which blockchain do you use?",
    answer: "We operate on Ethereum mainnet using USDT (ERC-20) tokens. You&apos;ll need an Ethereum-compatible wallet like MetaMask and some ETH for gas fees when making transactions.",
    category: "Technical & Security"
  },
  {
    id: "smart-contracts",
    question: "Are your smart contracts audited?",
    answer: "Yes, all our smart contracts undergo rigorous security audits by leading blockchain security firms. We prioritize security and transparency in all our technical implementations.",
    category: "Technical & Security"
  },
  {
    id: "wallet-security",
    question: "How secure are my funds?",
    answer: "Your funds are protected by multiple security layers: smart contract security, multi-signature wallets, cold storage for the majority of funds, and your principal is never used for trading activities.",
    category: "Technical & Security"
  },
  {
    id: "kyc-required",
    question: "Do I need to complete KYC?",
    answer: "Basic KYC may be required for larger investments or withdrawals to comply with regulations. We&apos;ll notify you if KYC is needed for your account level.",
    category: "Technical & Security"
  },

  // Program Details
  {
    id: "program-duration",
    question: "How long does Program I last?",
    answer: "Program I runs for 426 days (August 1, 2025 to September 30, 2026). After this, Program II will launch with enhanced features and potentially higher returns.",
    category: "Program Details"
  },
  {
    id: "what-after-program",
    question: "What happens after Program I ends?",
    answer: "You can withdraw all your funds (principal + accumulated income) or roll over into Program II which will offer improved features and potentially higher returns (0.80%-1.05% daily).",
    category: "Program Details"
  },
  {
    id: "founder-benefits",
    question: "What are the Founder benefits?",
    answer: "Program I founders get: VIP customer support, exclusive platform updates, priority access to new features, special community access, and potential bonuses for early adoption.",
    category: "Program Details"
  },
  {
    id: "future-programs",
    question: "Tell me about future programs",
    answer: "Program II (Oct 2026-Sep 2027): 0.80%-1.05% daily, Program III (Oct 2027-Sep 2028): 0.85%-1.10% daily, Program IV (Oct 2028+): 0.90%-1.15% daily with DAO governance.",
    category: "Program Details"
  },

  // Risk & Compliance
  {
    id: "investment-risks",
    question: "What are the risks?",
    answer: "While your principal is protected, crypto markets carry inherent risks. Our diversified trading strategies and professional team minimize risk, but no investment is 100% guaranteed. Only invest what you can afford.",
    category: "Risk & Compliance"
  },
  {
    id: "regulatory-compliance",
    question: "Are you regulated?",
    answer: "We operate in compliance with applicable regulations and continuously monitor the regulatory landscape. We&apos;re committed to maintaining full transparency and legal compliance.",
    category: "Risk & Compliance"
  },
  {
    id: "exit-strategy",
    question: "Can I exit anytime?",
    answer: "You can withdraw your income anytime (minimum $1,000). Your principal can be withdrawn after the 6-month lock period. We recommend planning your investment timeline accordingly.",
    category: "Risk & Compliance"
  }
];

const categories = [
  "All",
  "Getting Started",
  "Investment & Returns", 
  "Withdrawals & Fees",
  "Team Building & Bonuses",
  "Technical & Security",
  "Program Details",
  "Risk & Compliance"
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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
            Frequently Asked Questions
          </TextAnimate>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Everything you need to know about Phantom Stake, returns, security, and getting started.
            <br />Can&apos;t find your question? <span className="text-green-400 font-semibold">Contact our support team.</span>
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 backdrop-blur-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-400">
            Showing {filteredFAQs.length} of {faqData.length} questions
            {searchTerm && <span> for "{searchTerm}"</span>}
            {selectedCategory !== "All" && <span> in {selectedCategory}</span>}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="max-w-4xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-gray-900/50 border border-gray-600/30 rounded-xl backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-800/50 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                </div>
                <div className={`text-gray-400 transform transition-transform duration-200 ${
                  expandedItems.includes(faq.id) ? 'rotate-180' : ''
                }`}>
                  ▼
                </div>
              </button>
              
              {expandedItems.includes(faq.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-4"
                >
                  <div className="border-t border-gray-600/30 pt-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-bold text-white mb-2">No questions found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Contact Section */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-xl p-8 max-w-4xl mx-auto text-center backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h3>
          <p className="text-gray-300 mb-6 text-lg">
            Our support team is here to help you 24/7. Get personalized answers to your questions.
          </p>
          
          <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-bold text-white mb-3">📧 Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-green-400 font-semibold">Email Support:</span>
                <a 
                  href="mailto:support@phantomwallet.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors underline"
                >
                  support@phantomwallet.com
                </a>
              </div>
              <p className="text-gray-400 text-sm">Average response time: 2-4 hours</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ShimmerButton
              shimmerColor="#a855f7"
              background="rgba(139, 69, 219, 0.1)"
              borderRadius="8px"
              className="px-8 py-4 text-purple-400 border-purple-500/30 font-semibold text-lg"
            >
              Join Community
            </ShimmerButton>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>24/7 Support Available</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Average Response: 2 Hours</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Multiple Support Channels</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h4 className="text-lg font-bold text-white mb-4">Explore More</h4>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/calculator" className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors">
              📊 Calculate Returns
            </a>
            <a href="/how-it-works" className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors">
              🔍 How It Works
            </a>
            <a href="/programs" className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors">
              🚀 All Programs
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 