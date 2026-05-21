'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Bell, Settings, CreditCard, User, Shield, Store } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your shop profile, team members, and billing.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {['Shop Profile', 'Account & Security', 'Notifications', 'Team Management', 'Billing & Plans'].map((item, i) => (
            <button key={item} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${i === 0 ? 'bg-[#8B5CF6] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              {item}
            </button>
          ))}
        </div>
        
        <div className="col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Store size={24} className="text-[#8B5CF6]" />
              <h2 className="text-xl font-bold text-gray-800">Shop Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Shop Name</label>
                  <input type="text" defaultValue="DukaanAI Supermart" className="w-full mt-1 border border-gray-200 rounded-lg p-3 bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">GSTIN</label>
                  <input type="text" defaultValue="07AAAAA1234A1Z5" className="w-full mt-1 border border-gray-200 rounded-lg p-3 bg-gray-50 uppercase" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700">Shop Address</label>
                <textarea className="w-full mt-1 border border-gray-200 rounded-lg p-3 bg-gray-50 h-24" defaultValue="123 Retail Hub, Sector 14, Delhi"></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button className="bg-[#8B5CF6] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-[#7C3AED] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
