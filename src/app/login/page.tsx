"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextAnimate } from "@/components/ui/text-animate";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check if user is admin
      const adminUsernames = ['admin', 'amankumar', 'phantom_admin'];
      if (adminUsernames.includes(user.username.toLowerCase())) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.emailOrUsername, formData.password);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center py-12 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <TextAnimate 
            animation="blurInUp"
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            Welcome Back
          </TextAnimate>
          <p className="text-gray-400 text-lg">
            Sign in to your Phantom Stake account
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Email/Username Field */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
                placeholder="Enter your email or username"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <PulsatingButton 
              pulseColor="#10b981"
              className="w-full bg-gradient-to-r from-green-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </PulsatingButton>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600/30"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600/30"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              Don't have an account?
            </p>
            <Link href="/register">
              <ShimmerButton
                shimmerColor="#a855f7"
                background="rgba(139, 69, 219, 0.1)"
                borderRadius="8px"
                className="w-full text-purple-400 border-purple-500/30 font-semibold py-3 px-6"
              >
                Create Account
              </ShimmerButton>
            </Link>
          </div>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mb-1"></span>
              <span>Secure Login</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mb-1"></span>
              <span>24/7 Access</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mb-1"></span>
              <span>Real-time Data</span>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            href="/" 
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}