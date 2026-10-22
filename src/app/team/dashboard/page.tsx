'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Coins,
  Landmark,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { IPlace } from '@/types';

interface TeamDashboardData {
  currency: string;
  team: {
    _id: string;
    teamName: string;
    approvalStatus: string;
    participationStatus: string;
    startingBudget: number;
    remainingBudget: number;
    totalSpent: number;
    placesCount: number;
  };
  members: Array<{ fullName: string; enrollmentNumber: string }>;
  purchasedPlaces: Array<{
    placeId: string;
    placeName: string;
    finalPurchasePrice: number;
    confirmedAt: string;
    notes?: string;
  }>;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [catalogue, setCatalogue] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, catRes] = await Promise.all([
        fetch('/api/team/dashboard'),
        fetch('/api/places'),
      ]);

      if (dashRes.status === 401 || dashRes.status === 403) {
        router.push('/login');
        return;
      }

      const dashData = await dashRes.json();
      const catData = await catRes.json();

      if (dashData.success) {
        setData(dashData);
      }
      if (catData.success) {
        setCatalogue(catData.places || []);
      }
    } catch (err) {
      console.error('Failed to load team dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const filteredCatalogue = catalogue.filter((p) =>
    p.placeName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-washi-100 dark:bg-sumi-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-torii-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-serif">Loading Team Portal...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-washi-100 dark:bg-sumi-950 text-sumi-900 dark:text-sumi-100">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-torii-600 text-white flex items-center justify-center font-serif font-black text-lg shadow-glow-torii">
            陣
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
              <span>{data.team.teamName}</span>
              <Badge variant={data.team.approvalStatus === 'APPROVED' ? 'available' : 'withdrawn'}>
                {data.team.approvalStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              Private Team Portal • Japanese Places Auction
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Team Financial Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sumi-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Remaining Budget
              </CardTitle>
              <Coins className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(data.team.remainingBudget, data.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Starting Budget: {formatCurrency(data.team.startingBudget, data.currency)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-kiniro-200 dark:border-kiniro-900/60 bg-kiniro-50/50 dark:bg-kiniro-950/20 shadow-sumi-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-kiniro-800 dark:text-kiniro-300">
                Total Amount Spent
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-kiniro-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-kiniro-700 dark:text-kiniro-400">
                {formatCurrency(data.team.totalSpent, data.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sum of your confirmed bids
              </p>
            </CardContent>
          </Card>

          <Card className="border-torii-200 dark:border-torii-900/60 bg-torii-50/50 dark:bg-torii-950/20 shadow-sumi-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-torii-800 dark:text-torii-300">
                Landmarks Acquired
              </CardTitle>
              <Landmark className="h-4 w-4 text-torii-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-torii-700 dark:text-torii-400">
                {data.purchasedPlaces.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed landmark allocations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Purchased Places */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <Landmark className="h-5 w-5 text-torii-600" />
              <span>Our Purchased Japanese Landmarks</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {data.purchasedPlaces.length} Places Owned
            </span>
          </div>

          {data.purchasedPlaces.length === 0 ? (
            <Card className="border-border/60 bg-card/60 p-8 text-center text-muted-foreground text-sm">
              Your team has not acquired any landmarks yet. Participate in the live physical auction in the room!
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.purchasedPlaces.map((p) => (
                <Card key={p.placeId} className="border-border bg-card shadow-sumi-sm overflow-hidden">
                  <div className="h-1 bg-torii-600" />
                  <CardContent className="p-4 space-y-2">
                    <div className="font-serif font-bold text-base text-foreground">
                      {p.placeName}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/80">
                      <span>Hammer Price:</span>
                      <span className="font-serif font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(p.finalPurchasePrice, data.currency)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Confirmed: {new Date(p.confirmedAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Public Places Catalogue (No actual worth!) */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-kiniro-600" />
                <span>Japanese Places Catalogue</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Browse official places up for physical auction, starting prices, and current availability.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search landmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCatalogue.map((place) => (
              <Card
                key={place._id}
                className="border-border/80 bg-card overflow-hidden shadow-sumi-sm hover:shadow-sumi-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full bg-muted overflow-hidden">
                    <img
                      src={place.imageUrl}
                      alt={place.placeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          place.status === 'NOT_SOLD'
                            ? 'available'
                            : place.status === 'SOLD'
                            ? 'sold'
                            : 'withdrawn'
                        }
                      >
                        {place.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-1.5">
                    <h4 className="font-serif font-bold text-base text-foreground line-clamp-1">
                      {place.placeName}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {place.description}
                    </p>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 border-t border-border/80 flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">Starting Price</div>
                  <div className="font-serif font-bold text-sm text-foreground">
                    {formatCurrency(place.startingPrice, data.currency)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="space-y-3 pt-4 border-t border-border/80">
          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Our Registered Members ({data.members.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {data.members.map((m, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card text-xs space-y-0.5">
                <div className="font-semibold text-foreground">{m.fullName}</div>
                <div className="text-muted-foreground font-mono">ID: {m.enrollmentNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
