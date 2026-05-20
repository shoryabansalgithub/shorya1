'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';

export function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main className="pt-16 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
