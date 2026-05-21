'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Bell, PackageOpen, AlertTriangle, UserCheck, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const notifs = [
    { id: 1, type: 'alert', title: 'Low Stock Alert', desc: 'Parle-G and 3 other items are below critical stock levels.', time: '10 mins ago', icon: AlertTriangle, color: 'text-orange-500 bg-orange-50' },
    { id: 2, type: 'success', title: 'Payment Received', desc: '₹12,500 received from Ramesh Kumar via UPI.', time: '1 hour ago', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
    { id: 3, type: 'warning', title: 'Udhar Overdue', desc: 'Suresh Yadav has an overdue balance of ₹8,760 for 5 days.', time: '3 hours ago', icon: UserCheck, color: 'text-red-500 bg-red-50' },
    { id: 4, type: 'info', title: 'New Stock Added', desc: 'Batch BAT-2601A (Maggi) inwarded successfully.', time: 'Yesterday', icon: PackageOpen, color: 'text-blue-500 bg-blue-50' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your store's alerts and activities.</p>
        </div>
        <button className="text-sm font-bold text-[#8B5CF6] hover:text-purple-700 transition-colors">
          Mark all as read
        </button>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-gray-100">
        {notifs.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{n.title}</h4>
                  <span className="text-[10px] font-bold text-gray-400">{n.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
