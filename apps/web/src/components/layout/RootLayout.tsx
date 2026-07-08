'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';

const AUTH_PATHS = ['/login', '/register'];

export function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main className="pt-20 md:pt-16 md:ml-64 min-h-screen">
        <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
