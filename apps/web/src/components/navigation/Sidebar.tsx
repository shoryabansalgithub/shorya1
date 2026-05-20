'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, PackageSearch, UserCheck, Users,
  ClipboardList, Receipt, UserCircle, BarChart3, Bot, Bell,
  Settings, Database, ChevronDown, Sparkles, ShoppingBag, Menu, X,
  ScanLine, Camera, SlidersHorizontal, ArrowUp, ArrowDown, GripVertical, CheckCircle2
} from 'lucide-react';
import { clsx } from '@/lib/utils';
import { useAppStore } from '@/store';

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Billing (POS)', href: '/billing', icon: ShoppingCart },
  { name: 'Products / Stock', href: '/products', icon: PackageSearch },
  { name: 'Customers (Udhar)', href: '/customers', icon: UserCheck, badge: 'New', badgeColor: 'bg-[#8B5CF6]' },
  { name: 'AI OCR Scanner', href: '/ai-scanner', icon: ScanLine, badge: 'Magic', badgeColor: 'bg-green-500' },
  { name: 'Smart Bill Capture', href: '/smart-capture', icon: Camera, badge: 'Mobile', badgeColor: 'bg-blue-500' },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: ClipboardList },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Employees', href: '/employees', icon: UserCircle },
  { name: 'Reports & Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, badge: 'Beta', badgeColor: 'bg-[#8B5CF6]' },
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: '6', badgeColor: 'bg-red-500' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  
  const [navItems, setNavItems] = useState(defaultNavigation);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem('sidebar_order');
      if (savedOrder) {
        try {
          const hrefOrder: string[] = JSON.parse(savedOrder);
          const sorted = [...defaultNavigation].sort((a, b) => {
            const indexA = hrefOrder.indexOf(a.href);
            const indexB = hrefOrder.indexOf(b.href);
            // Items not in saved order go to the bottom
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setNavItems(sorted);
        } catch (e) {
          console.error('Failed to parse sidebar order', e);
        }
      }
    }
  }, []);

  const saveOrder = (items: typeof defaultNavigation) => {
    setNavItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_order', JSON.stringify(items.map(item => item.href)));
    }
  };

  const moveUp = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (index === 0) return;
    const newItems = [...navItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    saveOrder(newItems);
  };

  const moveDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (index === navItems.length - 1) return;
    const newItems = [...navItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    saveOrder(newItems);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#8B5CF6] text-white shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <aside
        className={clsx(
          'sidebar-bg fixed left-0 top-0 h-screen w-64 text-gray-400 shadow-xl z-40 transition-transform duration-300 md:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <ShoppingBag size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-xl text-white tracking-tight">DukaanAI</div>
              <div className="text-[10px] text-gray-400 leading-tight">AI-Powered Business Assistant</div>
            </div>
          </Link>
        </div>

        {/* Menu Header with Edit Button */}
        <div className="px-6 flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Main Menu</span>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={clsx(
              "p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs",
              isEditMode ? "bg-[#8B5CF6] text-white" : "text-gray-500 hover:text-white hover:bg-white/10"
            )}
            title="Reorder Menu Items"
          >
            {isEditMode ? <CheckCircle2 size={12} /> : <SlidersHorizontal size={12} />}
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-hide">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href && !isEditMode;
            return (
              <div key={item.href} className="relative group/item flex items-center">
                <Link
                  href={isEditMode ? '#' : item.href}
                  onClick={(e) => {
                    if (isEditMode) e.preventDefault();
                    if (!isEditMode && window.innerWidth < 768) toggleSidebar();
                  }}
                  className={clsx(
                    'flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium',
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-[0_4px_15px_rgba(139,92,246,0.4)]'
                      : isEditMode 
                        ? 'border border-dashed border-gray-600/50 bg-black/20 text-gray-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isEditMode ? (
                      <GripVertical size={14} className="text-gray-600" />
                    ) : (
                      <Icon size={18} className={clsx(isActive ? 'text-white' : 'text-gray-400 group-hover:text-white')} />
                    )}
                    <span>{item.name}</span>
                  </div>
                  {!isEditMode && item.badge && (
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-md text-white font-bold', item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Edit Mode Reorder Buttons */}
                {isEditMode && (
                  <div className="absolute right-2 flex flex-col gap-1">
                    <button 
                      onClick={(e) => moveUp(e, index)}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => moveDown(e, index)}
                      disabled={index === navItems.length - 1}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Database Manager Accordion */}
          <div className="pt-4 mt-4 border-t border-white/5">
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <Database size={18} />
                <span>Database Manager</span>
              </div>
              <ChevronDown size={16} />
            </button>
            <div className="pl-11 pr-3 pt-1 pb-2 space-y-2">
              <Link href="/database/products" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                <div className="w-4 h-4 border border-gray-500 rounded flex items-center justify-center"><PackageSearch size={10} /></div>
                Products DB
              </Link>
              <Link href="/database/customers" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                <div className="w-4 h-4 border border-gray-500 rounded flex items-center justify-center"><Users size={10} /></div>
                Customers DB
              </Link>
            </div>
          </div>
        </nav>

        {/* Upgrade to Pro */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#2E1065] p-4 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Sparkles size={40} className="text-white" />
            </div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Sparkles size={12} className="text-yellow-500" />
              </div>
              Upgrade to Pro <span className="text-yellow-500">✨</span>
            </h4>
            <p className="text-[11px] text-gray-300 mb-4 leading-tight">
              Unlock advanced AI insights, cloud backup & more.
            </p>
            <button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
              Upgrade Now &rarr;
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
