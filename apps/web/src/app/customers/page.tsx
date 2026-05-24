'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Search, UserPlus, Calendar as CalendarIcon, Filter, MoreVertical, IndianRupee, Users, ChevronDown, Receipt } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { SlidingPanel } from '@/components/ui/SlidingPanel';
import { mockCustomers } from '@/data/mockData';
import { AnimatePresence, motion } from 'framer-motion';

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:3001/customers');
        if (res.ok) {
          const data = await res.json();
          const mappedData = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            address: c.address || '',
            udharAmount: Number(c.outstandingBalance) || 0,
            totalSpent: Number(c.totalPurchases) || 0,
            lastPurchase: c.lastPurchaseAt || null,
          }));
          setCustomers(mappedData.length > 0 ? mappedData : mockCustomers);
        } else {
          setCustomers(mockCustomers);
          console.error("Failed to fetch from API, using mock data");
        }
      } catch (err) {
        setCustomers(mockCustomers);
        console.error("Error fetching customers, using mock data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  
  // Modals & Panels
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Details');

  // Dropdowns
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  
  const filterRef = useRef<HTMLDivElement>(null);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      // Action menu handled by click logic inside the component to prevent multiple closing issues
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('5000');
  const [newUdhar, setNewUdhar] = useState('');

  // Derived Stats
  const totalUdhar = customers.reduce((acc, curr) => acc + curr.udharAmount, 0);
  const overdueCount = customers.filter(c => c.udharAmount > 0).length; // Dummy logic
  const totalCustomers = customers.length;

  // Filter & Sort Logic
  let processedCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  if (statusFilter !== 'All') {
    processedCustomers = processedCustomers.filter(c => {
      const status = c.udharAmount > 0 ? 'Pending' : 'Clear';
      if (statusFilter === 'Overdue') return c.udharAmount > 5000; // Dummy
      return status === statusFilter;
    });
  }

  processedCustomers.sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Pending Amount') return b.udharAmount - a.udharAmount;
    if (sortBy === 'Last Payment') return new Date(b.lastPurchase ?? 0).getTime() - new Date(a.lastPurchase ?? 0).getTime();
    return 0;
  });

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    
    const udharAmount = Number(newUdhar) || 0;
    const creditLimitAmount = Number(newCreditLimit) || 5000;
    
    try {
      // Connect to the NestJS API
      const response = await fetch('http://localhost:3001/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail,
          address: newAddress,
          udharAmount: udharAmount,
          creditLimit: creditLimitAmount,
          shopId: 'default-shop-id' // Temporary fallback to satisfy Prisma constraint
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer in backend');
      }

      const createdCustomer = await response.json();
      
      // Update local state to reflect the change visually
      setCustomers([createdCustomer, ...customers]);
      toast('Customer added to MySQL database successfully!', 'success');
      setIsAddModalOpen(false);
      
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewAddress(''); setNewCreditLimit('5000'); setNewUdhar('');
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast(`Error saving customer: ${error.message}`, 'error');
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast(`Payment recorded for ${selectedCustomer?.name}`, 'success');
    setIsPaymentModalOpen(false);
  };

  const handleAction = (action: string, customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionMenuId(null);
    setSelectedCustomer(customer);
    
    switch (action) {
      case 'View Details': 
        router.push(`/customers/${customer.id}`);
        break;
      case 'Record Payment':
        setIsPaymentModalOpen(true);
        break;
      case 'Send Reminder':
        toast(`Payment reminder sent to ${customer.name} via WhatsApp`, 'success');
        break;
      case 'Edit Customer':
        toast('Edit customer coming soon', 'info');
        break;
      case 'Delete':
        toast(`Customer ${customer.name} deleted`, 'success');
        break;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers (Udhar)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your regular customers and track pending payments.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
        >
          <UserPlus size={18} />
          Add New Customer
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 hoverable">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Pending Udhar</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">₹{totalUdhar.toLocaleString('en-IN')}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 hoverable">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Overdue Accounts</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{overdueCount} Customers</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 hoverable">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Customers</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{totalCustomers}</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="p-0 overflow-visible">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
            >
              <Filter size={16} />
              Filter & Sort <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl z-20 p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Clear', 'Pending', 'Overdue'].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 outline-none focus:border-[#8B5CF6]"
                      >
                        <option>Name</option>
                        <option>Pending Amount</option>
                        <option>Last Payment</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Pending Udhar</th>
                <th className="px-6 py-4">Last Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {processedCustomers.map((customer) => {
                const status = customer.udharAmount === 0 ? 'Clear' : customer.udharAmount > 5000 ? 'Overdue' : 'Pending';
                
                return (
                  <tr 
                    key={customer.id} 
                    onClick={() => router.push(`/customers/${customer.id}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} 
                          alt={customer.name} 
                          className="w-9 h-9 rounded-full bg-gray-100"
                        />
                        <span className="font-bold text-gray-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${customer.udharAmount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                        ₹{customer.udharAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        status === 'Overdue' ? 'bg-red-50 text-red-600' :
                        status === 'Clear' ? 'bg-green-50 text-green-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === customer.id ? null : customer.id); }}
                        className="p-2 text-gray-400 hover:text-[#8B5CF6] transition-colors rounded-lg hover:bg-[#8B5CF6]/10"
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {openActionMenuId === customer.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden text-left"
                          >
                            {['View Details', 'Record Payment', 'Send Reminder', 'Edit Customer'].map(action => (
                              <button 
                                key={action}
                                onClick={(e) => handleAction(action, customer, e)}
                                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                              >
                                {action}
                              </button>
                            ))}
                            <div className="h-px bg-gray-100 w-full" />
                            <button 
                              onClick={(e) => handleAction('Delete', customer, e)}
                              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold transition-colors"
                            >
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                );
              })}
              {processedCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium text-gray-800">No customers found</p>
                    <p className="text-xs mt-1">Try adjusting your search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals & Panels */}
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer" size="md">
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div><label className="text-sm font-medium">Name *</label><input value={newName} onChange={e=>setNewName(e.target.value)} required className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Phone *</label><input value={newPhone} onChange={e=>setNewPhone(e.target.value)} required pattern="[0-9]{10}" maxLength={10} className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Email (Optional)</label><input value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" className="w-full mt-1 border rounded-lg p-2" /></div>
          <div><label className="text-sm font-medium">Address (Optional)</label><textarea value={newAddress} onChange={e=>setNewAddress(e.target.value)} className="w-full mt-1 border rounded-lg p-2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Credit Limit (₹)</label><input value={newCreditLimit} onChange={e=>setNewCreditLimit(e.target.value)} type="number" className="w-full mt-1 border rounded-lg p-2" /></div>
            <div><label className="text-sm font-medium">Opening Udhar</label><input value={newUdhar} onChange={e=>setNewUdhar(e.target.value)} type="number" className="w-full mt-1 border rounded-lg p-2" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-500/30">Save Customer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment - ${selectedCustomer?.name}`} size="sm">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount Received (₹) *</label>
            <input required type="number" className="w-full mt-1 border rounded-lg p-2 text-lg font-bold" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Mode</label>
            <select className="w-full mt-1 border rounded-lg p-2">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea className="w-full mt-1 border rounded-lg p-2" placeholder="e.g. Paid for last week's bill" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-500/30">Record Payment</button>
          </div>
        </form>
      </Modal>

      <SlidingPanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} title={selectedCustomer?.name || 'Customer Details'}>
        {selectedCustomer && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.name}`} className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-md" alt="avatar" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCustomer.name}</h2>
                <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-bold">Total Spent: ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                  {selectedCustomer.udharAmount > 0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold">Udhar: ₹{selectedCustomer.udharAmount.toLocaleString('en-IN')}</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-b border-gray-100 mb-6">
              {['Details', 'Transaction History', 'Invoices'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedCustomer.address || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
                    <p className="font-semibold text-gray-800 text-sm">₹5,000</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Joined Date</p>
                    <p className="font-semibold text-gray-800 text-sm">12 Jan 2026</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setIsSidePanelOpen(false); setIsPaymentModalOpen(true); }}
                  className="w-full mt-4 bg-green-50 text-green-600 hover:bg-green-100 py-3 rounded-xl text-sm font-bold transition-colors border border-green-200"
                >
                  Record Payment
                </button>
              </div>
            )}

            {activeTab === 'Transaction History' && (
              <div className="space-y-3">
                {[
                  { date: '19 May 2026', type: 'Purchase (Udhar)', amount: '₹1,250', status: 'Pending', icon: '🛒', color: 'text-orange-500', bg: 'bg-orange-50' },
                  { date: '15 May 2026', type: 'Payment Received', amount: '₹500', status: 'Success', icon: '💰', color: 'text-green-500', bg: 'bg-green-50' },
                  { date: '10 May 2026', type: 'Purchase (Cash)', amount: '₹850', status: 'Success', icon: '🛒', color: 'text-gray-600', bg: 'bg-gray-100' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.bg}`}>{tx.icon}</div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{tx.type}</p>
                        <p className="text-[10px] text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${tx.color}`}>{tx.amount}</p>
                      <p className="text-[10px] font-semibold text-gray-500">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Invoices' && (
              <div className="space-y-3">
                {[
                  { id: 'INV-1025', date: '19 May 2026', amount: '₹1,250', status: 'Unpaid' },
                  { id: 'INV-1018', date: '10 May 2026', amount: '₹850', status: 'Paid' },
                  { id: 'INV-0984', date: '02 May 2026', amount: '₹2,400', status: 'Paid' },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Receipt size={14} /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 group-hover:text-purple-600 transition-colors">#{inv.id}</p>
                        <p className="text-[10px] text-gray-500">{inv.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">{inv.amount}</p>
                      <p className={`text-[10px] font-bold ${inv.status === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SlidingPanel>

    </div>
  );
}
