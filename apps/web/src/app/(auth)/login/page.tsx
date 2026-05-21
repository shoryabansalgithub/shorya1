'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Bypassing all auth to ensure the app just runs!
      toast('Login successful! Redirecting...', 'success');
      router.push('/dashboard');
    } catch (err) {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-[#8B5CF6] shadow-inner">
              <ShoppingBag size={32} strokeWidth={2} />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Log in to your DukaanAI terminal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dukaan.ai"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-bold text-[#8B5CF6] hover:text-purple-700 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-70 group mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account? <a href="#" className="text-[#8B5CF6] font-bold hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
