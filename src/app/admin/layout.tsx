'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Landmark,
  Gavel,
  MonitorPlay,
  Trophy,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if session is active
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'ADMIN') {
          if (!pathname.includes('/admin/login')) {
            router.push('/admin/login');
          }
        } else {
          setAdminUser(data.user.username);
        }
      })
      .catch(() => {
        if (!pathname.includes('/admin/login')) {
          router.push('/admin/login');
        }
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // If on admin login page, don't show the admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Team Management', href: '/admin/teams', icon: Users },
    { label: 'Japanese Places', href: '/admin/places', icon: Landmark },
    { label: 'Record Sale (Live)', href: '/admin/sales', icon: Gavel },
    { label: 'Results & Rankings', href: '/admin/results', icon: Trophy },
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
    { label: 'Event Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-sumi-950 text-sumi-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-sumi-800 bg-sumi-900/90 backdrop-blur-md p-4">
        <div className="space-y-6">
          {/* Logo & Emblem */}
          <div className="flex items-center space-x-3 px-2 py-3 border-b border-sumi-800">
            <div className="h-10 w-10 rounded-xl bg-torii-600 text-white flex items-center justify-center shadow-glow-torii font-serif font-black text-lg">
              鳥
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wide text-white">
                Admin Console
              </div>
              <div className="text-[11px] text-sumi-400 font-sans flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Auction Active
              </div>
            </div>
          </div>

          {/* Big-Screen Presentation Launch Shortcut */}
          <div className="px-1">
            <Link href="/presentation" target="_blank">
              <Button
                variant="gold"
                className="w-full justify-between shadow-glow-gold text-sumi-950 font-bold text-xs h-10"
              >
                <span className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4" />
                  Presentation Screen
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-torii-600/20 text-torii-400 border border-torii-600/30 font-semibold'
                        : 'text-sumi-300 hover:bg-sumi-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Admin Profile and Logout */}
        <div className="pt-4 border-t border-sumi-800 space-y-3">
          <div className="px-2 flex items-center justify-between text-xs text-sumi-400">
            <span>Admin: <strong className="text-white">{adminUser}</strong></span>
            <Badge variant="gold" className="text-[10px] px-1.5 py-0">
              Auth OK
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-sumi-800 hover:bg-rose-950/40 hover:text-rose-300 text-xs text-sumi-400 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-sumi-800 bg-sumi-900/60 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-sumi-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="font-serif font-bold text-lg text-white tracking-wide hidden sm:block">
              Japanese Places Offline Auction Management
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/presentation" target="_blank">
              <Button size="sm" variant="gold" className="text-sumi-950 font-bold shadow-glow-gold text-xs h-8">
                <MonitorPlay className="h-3.5 w-3.5 mr-1.5" />
                Open Presentation
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-sumi-800 bg-sumi-900 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sumi-200 hover:bg-sumi-800"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
