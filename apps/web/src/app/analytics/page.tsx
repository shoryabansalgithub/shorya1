'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, TrendingDown, Users, Package, Wallet, CreditCard, 
  Download, Calendar, BarChart3, PieChart as PieChartIcon, Activity, AlertCircle
} from 'lucide-react';
import { 
  mockSalesData, mockProductSales, mockCategorySales, 
  mockPaymentModes, mockCustomerAnalytics 
} from '@/data/mockData';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useToast } from '@/components/ui/Toast';

const RADIAN = Math.PI / 180;
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('This Week');

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 text-white p-3 rounded-xl shadow-xl">
          <p className="font-bold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="font-bold">₹{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const exportReport = () => {
    toast(`Generating PDF Report for ${timeRange}...`, 'success');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Data-driven insights to grow your retail business.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={timeRange} 
              onChange={e => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button 
            onClick={exportReport}
            className="bg-[#060B26] hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Top Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between hoverable group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">₹1,28,450</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-600 relative z-10">
            <TrendingUp size={14} /> <span>+12.5%</span> <span className="text-gray-400 font-medium ml-1">vs last week</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hoverable group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net Profit</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">₹32,780</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#8B5CF6]">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-600 relative z-10">
            <TrendingUp size={14} /> <span>+8.2%</span> <span className="text-gray-400 font-medium ml-1">vs last week</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hoverable group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Udhar Given</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">₹54,320</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-600 relative z-10">
            <TrendingUp size={14} /> <span>+15%</span> <span className="text-gray-400 font-medium ml-1">Risk Warning</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hoverable group overflow-hidden relative border-l-4 border-l-red-500">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Order Value</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">₹850</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-red-600 relative z-10">
            <TrendingDown size={14} /> <span>-2.4%</span> <span className="text-gray-400 font-medium ml-1">vs last week</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Area Chart */}
        <Card className="lg:col-span-2 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-[#8B5CF6]" />
              Revenue Trend ({timeRange})
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Modes Pie Chart */}
        <Card className="p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-500" />
              Payment Methods
            </h3>
          </div>
          <div className="h-[250px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPaymentModes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockPaymentModes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-4">
            {mockPaymentModes.map((mode, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }}></span>
                {mode.name} <span className="text-gray-400 font-medium ml-auto">{mode.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products Bar Chart */}
        <Card className="lg:col-span-2 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              Top Selling Categories
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategorySales} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} width={100} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" name="Sales (%)" radius={[0, 4, 4, 0]} barSize={24}>
                  {mockCategorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Customer Insights */}
        <Card className="p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-green-500" />
              Top Loyal Customers
            </h3>
          </div>
          <div className="space-y-4">
            {mockCustomerAnalytics.slice(0, 5).map((cust, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {cust.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{cust.name}</p>
                    <p className="text-[10px] text-gray-500">{cust.frequency} visits this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800">₹{cust.spent.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#8B5CF6] hover:bg-purple-50 transition-colors">
            View All Customers
          </button>
        </Card>
      </div>
    </div>
  );
}
