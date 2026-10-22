import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Japanese Places Offline Auction Management System',
  description:
    'A high-performance offline auction and budget management system for Japanese landmarks, cultural heritage sites, and historical places.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-washi-100 dark:bg-sumi-950 text-sumi-900 dark:text-sumi-100 antialiased selection:bg-torii-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
