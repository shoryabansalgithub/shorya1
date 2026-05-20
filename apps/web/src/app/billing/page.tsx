'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, Plus, Mic, Receipt, IndianRupee, Minus, CheckCircle2, ArrowRight } from 'lucide-react';

const DUMMY_PRODUCTS = [
  { id: 1, name: 'Aashirvaad Atta 5kg', price: 210, barcode: '890123' },
  { id: 2, name: 'Tata Salt 1kg', price: 24, barcode: '890124' },
  { id: 3, name: 'Maggi Noodles 140g', price: 14, barcode: '890125' },
  { id: 4, name: 'Amul Butter 100g', price: 54, barcode: '890126' },
  { id: 5, name: 'Surf Excel 1kg', price: 130, barcode: '890127' },
  { id: 6, name: 'Parle G Biscuit', price: 10, barcode: '890128' },
];

export default function BillingPage() {
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  // Right Sidebar State
  const [manualTotal, setManualTotal] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Custom item state (Left Sidebar)
  const [customAmount, setCustomAmount] = useState('');
  const [customName, setCustomName] = useState('');

  // Load customers on mount
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCustomers(data);
        } else {
          const MOCK = [
            { id: 1, name: 'Ramesh Kumar', phone: '9876543210', udhar: 12450, status: 'Overdue' }
          ];
          setCustomers(MOCK);
          fetch('/api/customers', {
            method: 'POST',
            body: JSON.stringify(MOCK)
          });
        }
      })
      .catch(err => console.error('Failed to fetch customers:', err));
  }, []);

  // Sync cart total to manualTotal when cart changes
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  useEffect(() => {
    if (cartTotal > 0) {
      setManualTotal(cartTotal.toString());
    } else {
      setManualTotal('');
    }
  }, [cartTotal]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount <= 0) return;

    const product = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'Custom Item',
      price: amount,
      barcode: '-'
    };
    
    addToCart(product);
    setCustomAmount('');
    setCustomName('');
  };

  const displayTotal = Number(manualTotal) || 0;
  const paid = Number(amountPaid) || 0;
  const pending = Math.max(0, displayTotal - paid);

  const handleCheckout = () => {
    if (displayTotal <= 0) return;
    
    // Update Udhar if customer selected and there is pending amount
    if (selectedCustomer && pending > 0) {
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedCustomer.id) {
          return { 
            ...c, 
            udhar: c.udhar + pending, 
            status: 'Pending', 
            lastPayment: new Date().toISOString().split('T')[0] 
          };
        }
        return c;
      });
      fetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(updatedCustomers)
      });
      setCustomers(updatedCustomers);
    }

    // Success State
    setIsSuccess(true);
    setTimeout(() => {
      setCart([]);
      setSelectedCustomer(null);
      setManualTotal('');
      setAmountPaid('');
      setIsSuccess(false);
    }, 2500);
  };

  const filteredProducts = DUMMY_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing and checkout</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
            <Mic size={18} className="text-[#8B5CF6]" />
            AI Voice Billing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Products & Cart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 bg-white">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products or scan barcode..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                />
              </div>
              <form onSubmit={handleAddCustom} className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Item Name (Optional)" 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full sm:w-40 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <div className="relative w-full sm:w-32">
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>
                <button type="submit" className="bg-[#1e293b] hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all whitespace-nowrap">
                  Add <Plus size={16} className="ml-1"/>
                </button>
              </form>
            </div>
            
            {/* Product Quick Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-gray-100">
              {filteredProducts.map(prod => (
                <div 
                  key={prod.id} 
                  onClick={() => addToCart(prod)}
                  className="bg-white border border-gray-100 p-4 rounded-xl cursor-pointer hover:border-[#8B5CF6] hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-bold text-gray-800 group-hover:text-[#8B5CF6] transition-colors">{prod.name}</p>
                  <p className="text-xs text-gray-500 mt-1">₹{prod.price}</p>
                </div>
              ))}
            </div>

            {/* Cart Table */}
            <div className="p-0 min-h-[300px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
                  <Receipt size={48} className="opacity-20 mb-4" />
                  <p className="text-sm">Cart is empty. Click products above to add.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-white text-gray-500 text-xs font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Qty</th>
                      <th className="px-5 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cart.map(item => (
                      <tr key={item.product.id}>
                        <td className="px-5 py-4 font-bold text-gray-800">{item.product.name}</td>
                        <td className="px-5 py-4">₹{item.product.price}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 bg-gray-50 w-fit rounded-lg border border-gray-100 p-1">
                            <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-red-500"><Minus size={14}/></button>
                            <span className="w-6 text-center font-medium">{item.qty}</span>
                            <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-green-500"><Plus size={14}/></button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-gray-800">
                          ₹{(item.product.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Checkout Summary matches Screenshot perfectly */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Bill Summary</h2>
            
            {/* Attach Customer (Hidden nicely above steps) */}
            <div className="mb-6">
              <select 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] text-gray-600"
                value={selectedCustomer ? selectedCustomer.id : ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedCustomer(customers.find(c => c.id === id) || null);
                }}
              >
                <option value="">Walk-in Customer (No Udhar)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (Udhar: ₹{c.udhar})</option>
                ))}
              </select>
            </div>

            {/* Step 1 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="font-bold text-gray-800 text-sm">Total Purchase Amount</h3>
              </div>
              <p className="text-xs text-gray-400 mb-2 pl-7">Enter the total amount of all items</p>
              <div className="relative pl-7">
                <IndianRupee className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="number" 
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" 
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="font-bold text-gray-800 text-sm">Payment Details</h3>
              </div>
              <p className="text-xs text-gray-400 mb-2 pl-7">Enter the amount received from customer</p>
              <div className="relative pl-7">
                <IndianRupee className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="number" 
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" 
                />
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-3 mb-6 text-sm font-semibold pl-7 pr-1">
              <div className="flex justify-between text-gray-700">
                <span>Total Amount</span>
                <span>₹{displayTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Amount Paid</span>
                <span>₹{paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Pending Amount</span>
                <span>₹{pending.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Quick Actions</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAmountPaid(displayTotal.toString())}
                  className="flex-1 py-2 border border-green-500 text-green-600 hover:bg-green-50 rounded-lg text-sm font-bold transition-colors"
                >
                  Full Payment
                </button>
                <button 
                  onClick={() => {
                    setAmountPaid('');
                    setManualTotal('');
                    setCart([]);
                  }}
                  className="flex-1 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Submit Button */}
            {isSuccess ? (
              <div className="w-full bg-green-500 text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                Bill Generated!
              </div>
            ) : (
              <button 
                onClick={handleCheckout}
                disabled={displayTotal <= 0}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-purple-300 text-white py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                Complete Payment <ArrowRight size={18} />
              </button>
            )}
            
            <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1">
              🔒 Your data is secure and encrypted
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
