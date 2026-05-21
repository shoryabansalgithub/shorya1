'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { 
  ArrowLeft, Phone, MapPin, Calendar as CalendarIcon, MessageCircle, CreditCard, 
  MoreVertical, ShoppingCart, Banknote, History, FileText, ShieldAlert,
  Eye, Download, Link as LinkIcon, PhoneCall, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast(`Payment recorded for ${customer?.name}`, 'success');
    setIsPaymentModalOpen(false);
  };

  useEffect(() => {
    if (params.id) {
      fetch('/api/customers')
        .then(res => res.json())
        .then(customers => {
          if (customers) {
            const found = customers.find((c: any) => c.id.toString() === params.id.toString());
            if (found) {
              setCustomer(found);
            } else {
              setCustomer({
                id: params.id,
                name: 'Tanish',
                phone: '+91 9607-973',
                udhar: 16420,
                status: 'Pending'
              });
            }
          }
        })
        .catch(err => console.error('Failed to fetch customers:', err));
    }
  }, [params.id]);

  if (!customer) return <div className="p-10 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div></div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push('/customers')}
        className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#8B5CF6] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </button>

      {/* Header Profile Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-6 items-start">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} 
            alt={customer.name} 
            className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-50"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
              <span className="bg-purple-50 text-[#8B5CF6] px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                Regular Customer
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {customer.phone}
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                Customer ID: CUST-{customer.id.toString().padStart(4, '0')}
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-gray-400" />
                Joined on: 10 Jan 2025
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                Address: Udaipur, Rajasthan
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button onClick={() => toast(`WhatsApp Message opened for ${customer.phone}`, 'success')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-green-500 text-green-600 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors">
            <MessageCircle size={16} />
            Send WhatsApp
          </button>
          <button onClick={() => setIsPaymentModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-[#8B5CF6] border border-purple-200 rounded-xl text-sm font-bold hover:bg-purple-100 transition-colors">
            <CreditCard size={16} />
            Add Payment
          </button>
          <button onClick={() => toast('Showing more actions', 'info')} className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
            More Actions <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-purple-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#8B5CF6]">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Purchases</p>
            <h3 className="text-xl font-bold text-gray-800">₹58,420</h3>
            <p className="text-[10px] text-gray-400 mt-1">All time</p>
          </div>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
              <Banknote size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Paid</p>
            <h3 className="text-xl font-bold text-gray-800">₹42,000</h3>
            <p className="text-[10px] text-gray-400 mt-1">All time</p>
          </div>
        </Card>

        <Card className="p-4 border border-orange-100 shadow-sm flex flex-col justify-between bg-orange-50/30">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
              <History size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Pending</p>
            <h3 className="text-xl font-bold text-gray-800">₹{customer.udhar.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-gray-400 mt-1">All time</p>
          </div>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
              <CalendarIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Bills</p>
            <h3 className="text-xl font-bold text-gray-800">4</h3>
            <p className="text-[10px] text-gray-400 mt-1">Invoices</p>
          </div>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <CalendarIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Last Payment</p>
            <h3 className="text-[15px] font-bold text-gray-800 whitespace-nowrap">15 May 2026</h3>
            <p className="text-[10px] text-gray-400 mt-1">UPI</p>
          </div>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Credit Status</p>
            <h3 className="text-[15px] font-bold text-yellow-600 whitespace-nowrap">Medium Risk</h3>
            <p className="text-[10px] text-gray-400 mt-1">Paying with delay</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200">
        <button className="pb-3 text-sm font-bold text-[#8B5CF6] border-b-2 border-[#8B5CF6]">Overview</button>
        <button className="pb-3 text-sm font-bold text-gray-500 hover:text-gray-800">Invoices</button>
        <button className="pb-3 text-sm font-bold text-gray-500 hover:text-gray-800">Payments</button>
        <button className="pb-3 text-sm font-bold text-gray-500 hover:text-gray-800">Ledger</button>
        <button className="pb-3 text-sm font-bold text-gray-500 hover:text-gray-800">Notes & Reminders</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Content Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recent Orders / Invoices */}
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Recent Orders / Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Invoice ID</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Paid Amount</th>
                    <th className="px-5 py-3">Pending Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">19 May 2026</td>
                    <td className="px-5 py-4 font-medium">INV-2034</td>
                    <td className="px-5 py-4">₹2,500</td>
                    <td className="px-5 py-4">₹1,000</td>
                    <td className="px-5 py-4">₹1,500</td>
                    <td className="px-5 py-4"><span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Partial</span></td>
                    <td className="px-5 py-4 flex gap-2">
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Eye size={16}/></button>
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Download size={16}/></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">18 May 2026</td>
                    <td className="px-5 py-4 font-medium">INV-2031</td>
                    <td className="px-5 py-4">₹800</td>
                    <td className="px-5 py-4">₹800</td>
                    <td className="px-5 py-4">₹0</td>
                    <td className="px-5 py-4"><span className="bg-green-50 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Paid</span></td>
                    <td className="px-5 py-4 flex gap-2">
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Eye size={16}/></button>
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Download size={16}/></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">16 May 2026</td>
                    <td className="px-5 py-4 font-medium">INV-2028</td>
                    <td className="px-5 py-4">₹5,400</td>
                    <td className="px-5 py-4">₹0</td>
                    <td className="px-5 py-4">₹5,400</td>
                    <td className="px-5 py-4"><span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Pending</span></td>
                    <td className="px-5 py-4 flex gap-2">
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Eye size={16}/></button>
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Download size={16}/></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">12 May 2026</td>
                    <td className="px-5 py-4 font-medium">INV-2025</td>
                    <td className="px-5 py-4">₹1,250</td>
                    <td className="px-5 py-4">₹500</td>
                    <td className="px-5 py-4">₹750</td>
                    <td className="px-5 py-4"><span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Partial</span></td>
                    <td className="px-5 py-4 flex gap-2">
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Eye size={16}/></button>
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Download size={16}/></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">10 May 2026</td>
                    <td className="px-5 py-4 font-medium">INV-2022</td>
                    <td className="px-5 py-4">₹3,200</td>
                    <td className="px-5 py-4">₹3,200</td>
                    <td className="px-5 py-4">₹0</td>
                    <td className="px-5 py-4"><span className="bg-green-50 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Paid</span></td>
                    <td className="px-5 py-4 flex gap-2">
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Eye size={16}/></button>
                      <button className="text-[#8B5CF6] hover:bg-purple-50 p-1 rounded"><Download size={16}/></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-center">
              <button className="text-[#8B5CF6] text-sm font-bold hover:underline">View All Invoices</button>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Payment History</h2>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#8B5CF6]">
                    <span className="font-bold text-xs">UPI</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">19 May 2026, 11:30 AM</p>
                    <p className="text-xs text-gray-500">UPI Payment</p>
                  </div>
                </div>
                <div className="text-green-500 font-bold">₹1,000</div>
                <div className="text-xs text-gray-500 hidden sm:block">UPI ID: tanish@upi</div>
                <div className="text-xs text-gray-500 hidden md:block">Ref: UPI347812</div>
                <button className="text-gray-400 hover:text-gray-800"><MoreVertical size={16}/></button>
              </div>
              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Banknote size={16}/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">15 May 2026, 04:20 PM</p>
                    <p className="text-xs text-gray-500">Cash Payment</p>
                  </div>
                </div>
                <div className="text-green-500 font-bold">₹500</div>
                <div className="text-xs text-gray-500 hidden sm:block">Received by: Aryan</div>
                <div className="text-xs text-gray-500 hidden md:block">Note: Due payment</div>
                <button className="text-gray-400 hover:text-gray-800"><MoreVertical size={16}/></button>
              </div>
              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard size={16}/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">10 May 2026, 10:15 AM</p>
                    <p className="text-xs text-gray-500">Bank Transfer</p>
                  </div>
                </div>
                <div className="text-green-500 font-bold">₹2,000</div>
                <div className="text-xs text-gray-500 hidden sm:block">HDFC Bank - 1234</div>
                <div className="text-xs text-gray-500 hidden md:block">Ref: HDFC88991</div>
                <button className="text-gray-400 hover:text-gray-800"><MoreVertical size={16}/></button>
              </div>
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-center">
              <button className="text-[#8B5CF6] text-sm font-bold hover:underline">View All Payments</button>
            </div>
          </Card>

        </div>

        {/* Right Content Column */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Latest Invoices Thumbnail Grid */}
          <Card className="p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Latest Invoices</h2>
              <button className="text-[#8B5CF6] text-xs font-bold hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Mock Invoice 1 */}
              <div className="border border-gray-200 rounded-lg p-2 hover:border-[#8B5CF6] transition-colors cursor-pointer group">
                <div className="bg-gray-50 h-24 mb-2 flex items-center justify-center rounded border border-gray-100 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 p-2 text-[4px] leading-tight text-gray-500">
                    <div>INVOICE #INV-2034</div><br/>
                    <div>Item A.... ₹1000</div>
                    <div>Item B.... ₹1500</div>
                  </div>
                  <div className="absolute bottom-1 right-1 text-red-500 opacity-80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-800">INV-2034</p>
                <p className="text-[9px] text-gray-500">19 May 2026</p>
                <p className="text-[11px] font-bold text-gray-800">₹2,500</p>
                <span className="bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded text-[8px] font-bold inline-block mt-1">Partial</span>
              </div>
              {/* Mock Invoice 2 */}
              <div className="border border-gray-200 rounded-lg p-2 hover:border-[#8B5CF6] transition-colors cursor-pointer group">
                <div className="bg-gray-50 h-24 mb-2 flex items-center justify-center rounded border border-gray-100 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 p-2 text-[4px] leading-tight text-gray-500">
                    <div>INVOICE #INV-2031</div><br/>
                    <div>Item X.... ₹800</div>
                  </div>
                  <div className="absolute bottom-1 right-1 text-red-500 opacity-80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-800">INV-2031</p>
                <p className="text-[9px] text-gray-500">18 May 2026</p>
                <p className="text-[11px] font-bold text-gray-800">₹800</p>
                <span className="bg-green-50 text-green-500 px-1.5 py-0.5 rounded text-[8px] font-bold inline-block mt-1">Paid</span>
              </div>
              {/* Mock Invoice 3 */}
              <div className="border border-gray-200 rounded-lg p-2 hover:border-[#8B5CF6] transition-colors cursor-pointer group">
                <div className="bg-gray-50 h-24 mb-2 flex items-center justify-center rounded border border-gray-100 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 p-2 text-[4px] leading-tight text-gray-500">
                    <div>INVOICE #INV-2028</div><br/>
                    <div>Large Order</div>
                  </div>
                  <div className="absolute bottom-1 right-1 text-red-500 opacity-80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-800">INV-2028</p>
                <p className="text-[9px] text-gray-500">16 May 2026</p>
                <p className="text-[11px] font-bold text-gray-800">₹5,400</p>
                <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-[8px] font-bold inline-block mt-1">Pending</span>
              </div>
            </div>

              <button onClick={() => toast('Downloaded all invoices as PDF', 'success')} className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#8B5CF6] hover:bg-purple-50 transition-colors">
                <Download size={16} /> Download All Invoices (PDF)
              </button>
            </Card>

            {/* Notes Block */}
            <div className="bg-[#FFFDF0] border border-yellow-200 rounded-2xl p-5 shadow-sm relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={16} className="text-yellow-600" />
                  Notes
                </h2>
                <button onClick={() => toast('Opening Add Note UI', 'info')} className="text-[#8B5CF6] text-xs font-bold hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Note
                </button>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5 marker:text-yellow-400">
                <li>Customer usually pays at month end.</li>
                <li>Requested 7 days more on 19 May.</li>
                <li>Good customer, keep relation strong.</li>
              </ul>
              <p className="text-[10px] text-gray-400 mt-4">Last updated: 19 May 2026 by Aryan Sharma</p>
            </div>

            {/* Quick Actions */}
            <Card className="p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-[#8B5CF6]" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => toast('WhatsApp reminder sent!', 'success')} className="flex items-center justify-center gap-2 py-2.5 border border-green-500 text-green-600 rounded-lg text-xs font-bold hover:bg-green-50 transition-colors">
                  <MessageCircle size={14} /> Send WhatsApp Reminder
                </button>
                <button onClick={() => toast(`Calling ${customer.phone}...`, 'info')} className="flex items-center justify-center gap-2 py-2.5 border border-purple-200 text-[#8B5CF6] rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors">
                  <PhoneCall size={14} /> Call Customer
                </button>
                <button onClick={() => toast('Payment link sent via SMS', 'success')} className="flex items-center justify-center gap-2 py-2.5 border border-purple-200 text-[#8B5CF6] rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors">
                  <LinkIcon size={14} /> Send Payment Link
                </button>
                <button onClick={() => toast('Customer marked as High Risk', 'error')} className="flex items-center justify-center gap-2 py-2.5 border border-red-500 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                  <ShieldAlert size={14} /> Mark as High Risk
                </button>
              </div>
            </Card>

          </div>
        </div>

        {/* Modals */}
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment - ${customer?.name}`} size="sm">
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

      </div>
  );
}
