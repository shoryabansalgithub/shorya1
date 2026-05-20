import React from 'react';
import { Bell, Search, Mic, Sun, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store';

export function Navbar() {
  const { toggleSidebar } = useAppStore();

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 h-[72px] bg-white border-b border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] z-30 flex items-center justify-between px-6">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products, customers, invoices... (e.g. magi, coca, parl)" 
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 placeholder:text-gray-400"
          />
        </div>
        
        <button className="hidden md:flex items-center gap-2 bg-[#8B5CF6] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#7C3AED] transition-colors whitespace-nowrap shadow-md shadow-primary/20">
          <Mic size={16} />
          AI Voice Billing
        </button>
      </div>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-5">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Sun size={20} />
        </button>

        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            6
          </span>
        </button>

        <button className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-full">
          <MessageCircle size={20} className="fill-current" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-5 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-gray-800 leading-tight">Aryan Sharma</p>
            <p className="text-[11px] text-gray-500 font-medium">Admin</p>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" 
            alt="User" 
            className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
