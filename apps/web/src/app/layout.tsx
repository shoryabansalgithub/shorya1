import type { Metadata, Viewport } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { ToastProvider } from '@/components/ui/Toast';
import Providers from '@/components/Providers';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'DukaanAI - AI-Powered Retail OS',
  description: 'AI-powered retail operating system for small businesses',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ToastProvider>
            <RootLayout>{children}</RootLayout>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
