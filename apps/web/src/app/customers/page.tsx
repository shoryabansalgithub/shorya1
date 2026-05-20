'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Search, Plus, UserPlus, Phone, CreditCard, Calendar as CalendarIcon, Filter, MoreVertical, IndianRupee, Users } from 'lucide-react';

// Mock data for customers
const MOCK_CUSTOMERS = [
  { id: 1, name: 'Ramesh Kumar', phone: '9876543210', udhar: 12450, lastPayment: '2026-05-15', status: 'Overdue' },
  { id: 2, name: 'Suresh Yadav', phone: '9123456780', udhar: 8760, lastPayment: '2026-05-18', status: 'Pending' },
  { id: 3, name: 'Amit Verma', phone: '9988776655', udhar: 5320, lastPayment: '2026-05-10', status: 'Overdue' },
  { id: 4, name: 'Neha Singh', phone: '8877665544', udhar: 2890, lastPayment: '2026-05-19', status: 'Pending' },
  { id: 5, name: 'Vikram Patel', phone: '7766554433', udhar: 0, lastPayment: '2026-05-19', status: 'Clear' },
  { id: 6, name: 'Anita Sharma', phone: '9898989898', udhar: 1500, lastPayment: '2026-05-12', status: 'Pending' },
];

type Customer = {
  id: number;
  name: string;
  phone: string;
  udhar: number;
  lastPayment: string;
  status: string;
};

export default function CustomersPage() {
  const router = useRouter();
  
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load customers from API on mount
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCustomers(data);
        } else {
          // If no data, use MOCK_CUSTOMERS and save it
          setCustomers(MOCK_CUSTOMERS);
          fetch('/api/customers', {
            method: 'POST',
            body: JSON.stringify(MOCK_CUSTOMERS)
          });
        }
      })
      .catch(err => console.error('Failed to fetch customers:', err));
  }, []);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUdhar, setNewUdhar] = useState('');

  // Derived Stats
  const totalUdhar = customers.reduce((acc, curr) => acc + curr.udhar, 0);
  const overdueCount = customers.filter(c => c.status === 'Overdue').length;
  const totalCustomers = customers.length;

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSaveCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return; // Basic validation
    
    const udharAmount = Number(newUdhar) || 0;
    const newCustomer = {
      id: Date.now(),
      name: newName,
      phone: newPhone,
      udhar: udharAmount,
      lastPayment: new Date().toISOString().split('T')[0],
      status: udharAmount > 0 ? 'Pending' : 'Clear'
    };
    
    // Add to top of list
    const updatedCustomers = [newCustomer, ...customers];
    setCustomers(updatedCustomers);
    
    // Save to API
    fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify(updatedCustomers)
    });
    
    // Reset form and close
    setNewName('');
    setNewPhone('');
    setNewUdhar('');
    setIsAddModalOpen(false);
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
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Pending Udhar</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">₹{totalUdhar.toLocaleString('en-IN')}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Overdue Accounts</p>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{overdueCount} Customers</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
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
      <Card className="p-0 overflow-hidden">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
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
                    <span className={`font-bold ${customer.udhar > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      ₹{customer.udhar.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(customer.lastPayment).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      customer.status === 'Overdue' ? 'bg-red-50 text-red-600' :
                      customer.status === 'Clear' ? 'bg-green-50 text-green-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#8B5CF6] transition-colors rounded-lg hover:bg-[#8B5CF6]/10">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
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

      {/* Add Customer Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={18} className="text-[#8B5CF6]" />
                Add New Customer
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Customer Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Initial Udhar (Optional)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="number" 
                    placeholder="₹0.00" 
                    value={newUdhar}
                    onChange={(e) => setNewUdhar(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]" 
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCustomer}
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 transition-all"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
