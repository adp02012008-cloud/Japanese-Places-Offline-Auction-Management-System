'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  Clock,
  Landmark,
  ShoppingBag,
  Coins,
  ShieldCheck,
  TrendingUp,
  MonitorPlay,
  Gavel,
  ArrowRight,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    approvedTeams: 0,
    pendingTeams: 0,
    totalPlaces: 0,
    unsoldPlaces: 0,
    soldPlaces: 0,
    totalExpenditure: 0,
    totalActualWorthAcquired: 0,
    completedPurchases: 0,
    currency: '₹',
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch teams, places, purchases, and settings in parallel
      const [teamsRes, placesRes, salesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/teams'),
        fetch('/api/admin/places'),
        fetch('/api/admin/sales'),
        fetch('/api/admin/settings'),
      ]);

      const teamsData = await teamsRes.json();
      const placesData = await placesRes.json();
      const salesData = await salesRes.json();
      const settingsData = await settingsRes.json();

      const teams = teamsData.teams || [];
      const places = placesData.places || [];
      const purchases = (salesData.purchases || []).filter((p: any) => p.status === 'CONFIRMED');
      const currency = settingsData.settings?.currency || '₹';

      const approvedTeams = teams.filter((t: any) => t.approvalStatus === 'APPROVED').length;
      const pendingTeams = teams.filter((t: any) => t.approvalStatus === 'PENDING').length;

      const unsoldPlaces = places.filter((p: any) => p.status === 'NOT_SOLD').length;
      const soldPlaces = places.filter((p: any) => p.status === 'SOLD').length;

      const totalExpenditure = purchases.reduce((acc: number, p: any) => acc + (p.finalPurchasePrice || 0), 0);
      const totalActualWorthAcquired = purchases.reduce((acc: number, p: any) => acc + (p.actualWorthAtSale || 0), 0);

      setStats({
        totalTeams: teams.length,
        approvedTeams,
        pendingTeams,
        totalPlaces: places.length,
        unsoldPlaces,
        soldPlaces,
        totalExpenditure,
        totalActualWorthAcquired,
        completedPurchases: purchases.length,
        currency,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner with Live Status & Quick Action */}
      <div className="rounded-2xl border border-sumi-800 bg-gradient-to-r from-sumi-900 via-sumi-900/90 to-sumi-950 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sumi-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-serif font-bold text-xl text-white">
              Live Offline Auction Hub
            </span>
            <Badge variant="gold" className="text-xs">
              Phase 1 Active
            </Badge>
          </div>
          <p className="text-sm text-sumi-400">
            Real-time multi-document balance deduction & big-screen presentation ready.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/sales" className="flex-1 md:flex-initial">
            <Button className="w-full bg-torii-600 hover:bg-torii-700 text-white font-semibold shadow-glow-torii">
              <Gavel className="h-4 w-4 mr-2" />
              Record A Sale
            </Button>
          </Link>

          <Link href="/presentation" target="_blank" className="flex-1 md:flex-initial">
            <Button variant="gold" className="w-full text-sumi-950 font-bold shadow-glow-gold">
              <MonitorPlay className="h-4 w-4 mr-2" />
              Projector Screen
            </Button>
          </Link>
        </div>
      </div>

      {/* 9 Prescribed Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Total Registered Teams */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Total Teams Registered</CardTitle>
            <Users className="h-4 w-4 text-torii-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-white">{stats.totalTeams}</div>
            <p className="text-xs text-sumi-400 mt-1">Across all event cohorts</p>
          </CardContent>
        </Card>

        {/* 2. Approved Teams */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Approved Teams</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-emerald-400">{stats.approvedTeams}</div>
            <p className="text-xs text-sumi-400 mt-1">Allocated active starting budgets</p>
          </CardContent>
        </Card>

        {/* 3. Pending Registrations */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-amber-400">{stats.pendingTeams}</div>
            <p className="text-xs text-sumi-400 mt-1">Awaiting admin review</p>
          </CardContent>
        </Card>

        {/* 4. Total Japanese Places */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Japanese Places in Database</CardTitle>
            <Landmark className="h-4 w-4 text-kiniro-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-white">{stats.totalPlaces}</div>
            <p className="text-xs text-sumi-400 mt-1">Landmarks, castles & temples</p>
          </CardContent>
        </Card>

        {/* 5. Places Not Yet Sold */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Available / Unsold Places</CardTitle>
            <ShoppingBag className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-cyan-400">{stats.unsoldPlaces}</div>
            <p className="text-xs text-sumi-400 mt-1">Ready for offline bidding</p>
          </CardContent>
        </Card>

        {/* 6. Places Sold */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Places Confirmed Sold</CardTitle>
            <Gavel className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-rose-400">{stats.soldPlaces}</div>
            <p className="text-xs text-sumi-400 mt-1">Allocated to winning teams</p>
          </CardContent>
        </Card>

        {/* 7. Total Auction Expenditure */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Total Auction Spending</CardTitle>
            <Coins className="h-4 w-4 text-kiniro-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-kiniro-400">
              {formatCurrency(stats.totalExpenditure, stats.currency)}
            </div>
            <p className="text-xs text-sumi-400 mt-1">Sum of confirmed purchase prices</p>
          </CardContent>
        </Card>

        {/* 8. Total Actual Worth Acquired */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Total Actual Worth Acquired</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-emerald-400">
              {formatCurrency(stats.totalActualWorthAcquired, stats.currency)}
            </div>
            <p className="text-xs text-sumi-400 mt-1">Admin confidential valuation sum</p>
          </CardContent>
        </Card>

        {/* 9. Completed Purchases */}
        <Card className="border-sumi-800 bg-sumi-900/70 hover:border-sumi-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sumi-400">Recorded Purchases</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-purple-400">{stats.completedPurchases}</div>
            <p className="text-xs text-sumi-400 mt-1">Audit-logged transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Card className="border-sumi-800 bg-sumi-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white">Live Operations Checklist</h3>
            <Badge variant="gold" className="text-xs">Live Workflow</Badge>
          </div>
          <p className="text-sm text-sumi-400">
            Follow these steps while conducting the physical bidding session in the room:
          </p>
          <ul className="space-y-3 text-sm text-sumi-300">
            <li className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sumi-800 text-xs flex items-center justify-center font-bold text-white">1</span>
              <span>Open the 16:9 Presentation screen on projector or TV</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sumi-800 text-xs flex items-center justify-center font-bold text-white">2</span>
              <span>Select an unsold Japanese landmark to display</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sumi-800 text-xs flex items-center justify-center font-bold text-white">3</span>
              <span>Audience bids physically in room (no online bids)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sumi-800 text-xs flex items-center justify-center font-bold text-white">4</span>
              <span>Enter winning team & final agreed price in "Record A Sale"</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sumi-800 text-xs flex items-center justify-center font-bold text-white">5</span>
              <span>Check "Results & Rankings" to announce the champion</span>
            </li>
          </ul>
        </Card>

        <Card className="border-sumi-800 bg-sumi-900/60 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Results Engine</h3>
              <Trophy className="h-5 w-5 text-kiniro-400" />
            </div>
            <p className="text-sm text-sumi-400">
              Authoritative savings and value efficiency figures are dynamically recalculated
              from the confirmed purchase ledger.
            </p>
          </div>

          <div className="pt-6">
            <Link href="/admin/results">
              <Button variant="outline" className="w-full border-sumi-700 hover:bg-sumi-800 text-white justify-between">
                <span>View Full Results & Announce Winner</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
