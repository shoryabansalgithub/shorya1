import type { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'DukaanAI - AI-Powered Retail OS',
  description: 'AI-powered retail operating system for small businesses',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
