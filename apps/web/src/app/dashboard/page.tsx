'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, Package, ShoppingBag, Users, Plus, 
  FileText, Database, ChevronDown, AlertCircle, 
  Search, Mic, Receipt, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { mockProducts } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy static charts for UI purposes to perfectly match the screenshot without complex chart setups
const DummyLineChart = () => (
  <div className="w-full h-[180px] mt-4 relative">
    {/* Background Grid */}
    <div className="absolute inset-0 flex flex-col justify-between">
      {[40, 30, 20, 10, 0].map(k => (
        <div key={k} className="flex items-center gap-2 text-[10px] text-gray-400 w-full border-b border-dashed border-gray-100 pb-1">
          <span>₹{k}k</span>
        </div>
      ))}
    </div>
    {/* Simulated SVG Line */}
    <div className="absolute inset-0 pt-6 ml-6">
      <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
        <path d="M0,100 C50,110 100,50 150,80 C200,110 250,20 300,50 C350,80 400,20 400,20" fill="none" stroke="#8B5CF6" strokeWidth="3" />
        <path d="M0,100 C50,110 100,50 150,80 C200,110 250,20 300,50 C350,80 400,20 400,20 L400,150 L0,150 Z" fill="url(#gradient)" opacity="0.2" />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Points */}
        {[
          {x: 0, y: 100}, {x: 150, y: 80}, {x: 300, y: 50}, {x: 400, y: 20}
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2" />
        ))}
      </svg>
    </div>
    <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-gray-400 font-medium pt-2">
      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
    </div>
    
    {/* Tooltip */}
    <div className="absolute top-[30px] left-[60%] -translate-x-1/2 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-lg py-1 px-3 border border-gray-100 z-10 text-center">
      <div className="text-[10px] text-gray-500">Friday, 17 May</div>
      <div className="text-sm font-bold text-gray-800">₹28,450</div>
    </div>
  </div>
);


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  
  const [productSearch, setProductSearch] = useState('magi');
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [timeSelection, setTimeSelection] = useState('This Week');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('5000');
  const [newUdhar, setNewUdhar] = useState('0');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/customers');
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          address: c.address || '',
          udharAmount: Number(c.outstandingBalance) || 0,
        }));
        setCustomers(mappedData);
      }
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsProductSearchFocused(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Create Bill': router.push('/billing'); break;
      case 'Add Product': setIsAddProductModalOpen(true); break;
      case 'Add Customer': setIsAddCustomerModalOpen(true); break;
      case 'Customer Udhar': router.push('/customers'); break;
      case 'Low Stock': router.push('/inventory?tab=low-stock'); break;
      case 'Expenses': router.push('/expenses'); break;
      case 'AI Assistant': router.push('/ai-assistant'); break;
      case 'Reports': router.push('/analytics'); break;
      case 'Database Manager': router.push('/database'); break;
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3002/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail,
          address: newAddress,
          udharAmount: Number(newUdhar) || 0,
          creditLimit: Number(newCreditLimit) || 5000,
          shopId: 'default-shop-id'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      toast('Customer added successfully', 'success');
      setIsAddCustomerModalOpen(false);
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewAddress(''); setNewCreditLimit('5000'); setNewUdhar('0');
      fetchCustomers();
    } catch (error: any) {
      toast(`Error saving customer: ${error.message}`, 'error');
    }
  };

  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Sales */}
        <Card className="hoverable p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Sales</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">₹1,28,450</h3>
            <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
              <span>▲ 18.4%</span> <span className="text-gray-400 font-medium">vs yesterday</span>
            </p>
          </div>
        </Card>

        {/* Total Profit */}
        <Card className="hoverable p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Profit</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">₹32,780</h3>
            <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
              <span>▲ 15.6%</span> <span className="text-gray-400 font-medium">vs yesterday</span>
            </p>
          </div>
        </Card>

        {/* Total Udhar */}
        <Card className="hoverable p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Udhar (Pending)</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">₹54,320</h3>
            <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
              <span>▼ 12.3%</span> <span className="text-gray-400 font-medium">from last month</span>
            </p>
          </div>
        </Card>

        {/* Low Stock Items */}
        <Card className="hoverable p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Low Stock Items</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">12</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Needs attention</p>
          </div>
        </Card>

        {/* Today's Orders */}
        <Card className="hoverable p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Today's Orders</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">86</h3>
            <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
              <span>▲ 21.2%</span> <span className="text-gray-400 font-medium">vs yesterday</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart + Quick Actions + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart */}
        <Card className="lg:col-span-6 p-5 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Sales Overview</h3>
            <div ref={timeDropdownRef} className="relative z-20">
              <div 
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {timeSelection} <ChevronDown size={14} className={`transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              <AnimatePresence>
                {isTimeDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden w-32"
                  >
                    {['Today', 'This Week', 'This Month', 'This Year'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setTimeSelection(option);
                          setIsTimeDropdownOpen(false);
                          toast(`Showing data for ${option}`, 'info');
                        }}
                        className={`w-full text-left text-xs px-4 py-2 hover:bg-purple-50 transition-colors ${timeSelection === option ? 'font-bold text-[#8B5CF6] bg-purple-50/50' : 'text-gray-600'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <DummyLineChart />
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 p-5 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: 'Create Bill', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
              { icon: Package, label: 'Add Product', color: 'text-green-500', bg: 'bg-green-500/10' },
              { icon: Users, label: 'Add Customer', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { icon: Users, label: 'Customer Udhar', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: Package, label: 'Low Stock', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { icon: FileText, label: 'Expenses', color: 'text-pink-500', bg: 'bg-pink-500/10' },
              { icon: Sparkles, label: 'AI Assistant', color: 'text-blue-600', bg: 'bg-blue-600/10', badge: 'Beta' },
              { icon: FileText, label: 'Reports', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
              { icon: Database, label: 'Database Manager', color: 'text-teal-500', bg: 'bg-teal-500/10' }
            ].map((action, i) => (
              <div 
                key={i} 
                onClick={() => handleQuickAction(action.label)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center h-[76px] relative"
              >
                {action.badge && <span className="absolute -top-2 -right-1 bg-blue-100 text-blue-600 text-[8px] font-bold px-1 rounded">{action.badge}</span>}
                <div className={`w-8 h-8 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
                  <action.icon size={14} />
                </div>
                <span className="text-[9px] font-semibold text-gray-600 leading-tight">{action.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-[15px]">Top Customers (Udhar)</h3>
            <span onClick={() => router.push('/customers')} className="text-xs text-[#8B5CF6] font-semibold cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {customers.filter(c => c.udharAmount > 0).sort((a, b) => b.udharAmount - a.udharAmount).slice(0, 5).map((c, i) => (
              <div key={i} onClick={() => router.push(`/customers/${c.id}`)} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 -mx-1 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} className="w-8 h-8 rounded-full bg-gray-100" alt="avatar" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500">₹{c.udharAmount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-red-400">Due</p>
                </div>
              </div>
            ))}
            {customers.filter(c => c.udharAmount > 0).length === 0 && (
              <p className="text-xs text-gray-500 py-2 text-center">No pending udhar</p>
            )}
            <button 
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="w-full mt-2 py-2 rounded-lg border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#8B5CF6]/5 transition-colors">
              <Plus size={14} /> Add New Customer
            </button>
          </div>
        </Card>

      </div>

      {/* Lower Middle Grid: Search + Low Stock + AI + Recent Tx */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Smart Product Search */}
        <Card className="lg:col-span-3 p-5 relative" ref={searchContainerRef}>
          <h3 className="font-bold text-gray-800 text-[15px] mb-3">Smart Product Search</h3>
          <div className="relative mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5CF6]" />
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onFocus={() => setIsProductSearchFocused(true)}
                className="w-full bg-[#8B5CF6]/10 text-[#8B5CF6] font-semibold text-sm rounded-lg pl-8 pr-16 py-2 outline-none border border-[#8B5CF6]/30" 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-[8px] bg-green-100 text-green-600 px-1 py-0.5 rounded font-bold">Fuzzy Match ON</span>
              </div>
            </div>
            <button 
              onClick={() => toast('Voice search activated — say a product name', 'info')}
              className="p-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors"
            >
              <Mic size={14} />
            </button>
          </div>
          
          <AnimatePresence>
            {isProductSearchFocused && productSearch && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-[110px] bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden"
              >
                {filteredProducts.length > 0 ? (
                  <div className="py-2">
                    {filteredProducts.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => router.push(`/billing?product=${p.id}`)}
                        className="w-full flex items-center justify-between text-xs px-4 py-2 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-sm flex items-center justify-center text-[10px]">P</div>
                          <span className="font-semibold text-gray-700">{p.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">₹{p.price}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-center text-sm text-gray-500">
                    No products found.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 mt-4">
            {[
              { name: 'Maggi 2-Minute (70g)', price: '₹14' },
              { name: 'Maggi Masala Noodles (Pack of 12)', price: '₹168' },
              { name: 'Maggi Hot & Sweet', price: '₹16' }
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-100 rounded-sm flex items-center justify-center text-[10px]">🍜</div>
                  <span className="font-semibold text-gray-700">{p.name}</span>
                </div>
                <span className="font-bold text-gray-800">{p.price}</span>
              </div>
            ))}
            <button className="w-full mt-2 pt-3 border-t border-gray-100 text-[#8B5CF6] text-xs font-bold flex items-center gap-1 hover:text-[#7C3AED] transition-colors">
              <Sparkles size={14} /> Create New Product "{productSearch || "magi"}"
            </button>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-3 p-5 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-[15px]">Low Stock Alerts</h3>
            <span className="text-xs text-[#8B5CF6] font-semibold cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Parle-G Biscuit', stock: 5, status: 'Critical', bg: 'bg-red-50', text: 'text-red-600', icon: '🍪' },
              { name: 'Surf Excel 1kg', stock: 8, status: 'Critical', bg: 'bg-red-50', text: 'text-red-600', icon: '🧼' },
              { name: 'Aashirvaad Atta 5kg', stock: 10, status: 'Low', bg: 'bg-amber-50', text: 'text-amber-600', icon: '🌾' },
              { name: 'Coca Cola 1L', stock: 12, status: 'Low', bg: 'bg-amber-50', text: 'text-amber-600', icon: '🥤' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-500">Stock: {item.stock} pcs</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.bg} ${item.text}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Business Insights */}
        <Card className="lg:col-span-3 p-5 bg-gradient-to-br from-[#EEF2FF] to-[#F3E8FF] border-[#8B5CF6]/20 relative overflow-hidden">
          <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2 mb-4">
            AI Business Insights <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] px-1.5 py-0.5 rounded">Beta</span>
          </h3>
          <div className="space-y-3 relative z-10">
            <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg text-[11px] font-medium text-gray-700 backdrop-blur-sm border border-white">
              <Sparkles size={14} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
              <span>Maggi sales increased 32% this week! 📈</span>
            </div>
            <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg text-[11px] font-medium text-gray-700 backdrop-blur-sm border border-white">
              <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Ramesh Kumar's udhar is ₹12,450 (Overdue 5 days)</span>
            </div>
            <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg text-[11px] font-medium text-gray-700 backdrop-blur-sm border border-white">
              <ShoppingBag size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Restock Parle-G & Surf Excel soon</span>
            </div>
            <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg text-[11px] font-medium text-gray-700 backdrop-blur-sm border border-white">
              <TrendingUp size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Peak sales time: 6PM - 9PM daily</span>
            </div>
            <button className="bg-[#8B5CF6] text-white text-[11px] font-bold px-4 py-2 rounded-lg mt-2 flex items-center gap-1 shadow-lg shadow-[#8B5CF6]/30">
              Ask AI Assistant &rarr;
            </button>
          </div>
          {/* Decorative AI Robot Placeholder */}
          <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-80 pointer-events-none drop-shadow-2xl text-8xl flex items-center justify-center">
            🤖
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-[15px]">Recent Transactions</h3>
            <span className="text-xs text-[#8B5CF6] font-semibold cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Ramesh Kumar (Udhar)', inv: 'INV-1025', amount: '₹1,250', color: 'text-red-500', icon: 'bg-orange-100 text-orange-500' },
              { name: 'Walk-in Customer (Cash)', inv: 'INV-1024', amount: '₹780', color: 'text-green-500', icon: 'bg-green-100 text-green-500' },
              { name: 'Suresh Yadav (Udhar)', inv: 'INV-1023', amount: '₹2,150', color: 'text-red-500', icon: 'bg-orange-100 text-orange-500' },
              { name: 'Neha Singh (UPI)', inv: 'INV-1022', amount: '₹980', color: 'text-green-500', icon: 'bg-blue-100 text-blue-500' }
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.icon}`}><Receipt size={14} /></div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-gray-400">#{t.inv}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${t.color}`}>{t.amount}</span>
              </div>
            ))}
            <button className="w-full text-center mt-2 pt-3 border-t border-gray-100 text-[#8B5CF6] text-[11px] font-bold flex items-center justify-center gap-1">
              See All Transactions &rarr;
            </button>
          </div>
        </Card>

      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Sales */}
        <Card className="p-5 flex items-center gap-6">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-[15px] mb-4">Category Sales</h3>
            <div className="w-32 h-32 mx-auto">
              {/* Complex SVG Donut representation */}
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#E5E7EB" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="42 100" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="21 100" strokeDashoffset="-42" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="17 100" strokeDashoffset="-63" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="12 100" strokeDashoffset="-80" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F43F5E" strokeWidth="4" strokeDasharray="8 100" strokeDashoffset="-92" />
              </svg>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 text-[10px] font-medium text-gray-600 mt-6">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Groceries</span> <span className="font-bold">42%</span> <span>₹53,890</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Beverages</span> <span className="font-bold">21%</span> <span>₹26,880</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Snacks</span> <span className="font-bold">17%</span> <span>₹21,760</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Personal Care</span> <span className="font-bold">12%</span> <span>₹15,320</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Others</span> <span className="font-bold">8%</span> <span>₹10,600</span></div>
          </div>
        </Card>

        {/* Payment Modes */}
        <Card className="p-5 flex items-center gap-6">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-[15px] mb-4">Payment Modes</h3>
            <div className="w-32 h-32 mx-auto">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#E5E7EB" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#3B82F6" strokeWidth="6" strokeDasharray="48 100" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="32 100" strokeDashoffset="-48" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="12 100" strokeDashoffset="-80" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F43F5E" strokeWidth="6" strokeDasharray="8 100" strokeDashoffset="-92" />
              </svg>
            </div>
          </div>
          <div className="flex-1 space-y-2 text-[11px] font-medium text-gray-600 mt-6">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> UPI</span> <span className="font-bold text-gray-800">48%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Cash</span> <span className="font-bold text-gray-800">32%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Card</span> <span className="font-bold text-gray-800">12%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Other</span> <span className="font-bold text-gray-800">8%</span></div>
          </div>
        </Card>

        {/* Udhar Overview */}
        <Card className="p-5 flex flex-col justify-between">
          <h3 className="font-bold text-gray-800 text-[15px]">Udhar Overview</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10B981" strokeWidth="6" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#EF4444" strokeWidth="6" strokeDasharray="65 100" />
              </svg>
            </div>
            <div className="flex-1 space-y-2 text-[11px] font-medium">
              <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Total Udhar</span> <span className="font-bold text-gray-800">₹54,320</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Paid (This Month)</span> <span className="font-bold text-green-600">₹18,760</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue</span> <span className="font-bold text-red-500">₹35,560</span></div>
            </div>
          </div>
          <button className="w-full text-center mt-4 pt-3 border-t border-gray-100 text-[#8B5CF6] text-[11px] font-bold flex items-center justify-center gap-1">
            View Full Report &rarr;
          </button>
        </Card>

      </div>

      <Modal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} title="Add New Product" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); toast('Product added successfully', 'success'); setIsAddProductModalOpen(false); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name *</label><input required className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">SKU (Auto-gen)</label><input defaultValue="PRD008" readOnly className="w-full mt-1 border rounded-lg p-2 bg-gray-50" /></div>
            <div><label className="text-sm font-medium">Category</label><input className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">GST Rate</label><select className="w-full mt-1 border rounded-lg p-2"><option>0%</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option></select></div>
            <div><label className="text-sm font-medium">Cost Price (₹)</label><input type="number" required className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">Selling Price (₹)</label><input type="number" required className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">MRP (₹)</label><input type="number" className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">Opening Stock</label><input type="number" defaultValue="0" className="w-full mt-1 border rounded-lg p-2" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg">Save Product</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} title="Add New Customer" size="md">
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <div><label className="text-sm font-medium">Name *</label><input value={newName} onChange={e=>setNewName(e.target.value)} required className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Phone *</label><input value={newPhone} onChange={e=>setNewPhone(e.target.value)} required pattern="[0-9]{10}" maxLength={10} className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Email (Optional)</label><input value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Address (Optional)</label><textarea value={newAddress} onChange={e=>setNewAddress(e.target.value)} className="w-full mt-1 border rounded-lg p-2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Credit Limit (₹)</label><input value={newCreditLimit} onChange={e=>setNewCreditLimit(e.target.value)} type="number" className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">Opening Udhar</label><input value={newUdhar} onChange={e=>setNewUdhar(e.target.value)} type="number" className="w-full mt-1 border rounded-lg p-2" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setIsAddCustomerModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg">Save Customer</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
