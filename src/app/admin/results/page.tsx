'use client';

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, convertToCSV } from '@/lib/utils';
import { ITeamResult, WinningRule } from '@/types';

export default function AdminResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ITeamResult[]>([]);
  const [activeRule, setActiveRule] = useState<WinningRule>('SAVINGS');
  const [currency, setCurrency] = useState('₹');
  const [winner, setWinner] = useState<ITeamResult | null>(null);
  const [isTie, setIsTie] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [announcing, setAnnouncing] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const [resData, settingsRes] = await Promise.all([
        fetch('/api/admin/results').then((r) => r.json()),
        fetch('/api/admin/settings').then((r) => r.json()),
      ]);

      if (resData.success) {
        setResults(resData.results || []);
        setActiveRule(resData.activeRule);
        setCurrency(resData.currency);
        setWinner(resData.winner);
        setIsTie(resData.isTie);
      }

      if (settingsRes.success) {
        setIsPublic(settingsRes.settings.isAnnouncementPublic);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleToggleAnnouncement = async () => {
    setAnnouncing(true);
    try {
      const res = await fetch('/api/admin/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAnnouncementPublic: !isPublic }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPublic(data.isAnnouncementPublic);
      }
    } catch (err) {
      console.error('Error toggling announcement:', err);
    } finally {
      setAnnouncing(false);
    }
  };

  const exportResultsCSV = () => {
    const headers = [
      'Rank',
      'Team Name',
      'Places Purchased',
      'Total Actual Worth (₹)',
      'Total Spent (₹)',
      'Total Savings (₹)',
      'Remaining Budget (₹)',
      'Value Efficiency (%)',
      'Budget Utilization (%)',
    ];

    const rows = results.map((r) => [
      r.rank,
      r.teamName,
      r.placesPurchased,
      r.totalActualWorth,
      r.totalSpent,
      r.totalSavings,
      r.remainingBudget,
      r.valueEfficiency !== null ? `${r.valueEfficiency}%` : 'N/A',
      r.budgetUtilization !== null ? `${r.budgetUtilization}%` : 'N/A',
    ]);

    const csvContent = convertToCSV(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `japanese_auction_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ruleNames: Record<WinningRule, string> = {
    SAVINGS: 'Highest Total Savings (Actual Worth − Total Spent)',
    EFFICIENCY: 'Highest Value Efficiency ((Actual Worth ÷ Total Spent) × 100)',
    ACTUAL_WORTH: 'Highest Total Actual Worth Acquired',
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-kiniro-400" />
            <span>Automatic Results & Winner Rankings</span>
          </h2>
          <p className="text-sm text-sumi-400">
            Authoritative figures calculated from the confirmed purchase ledger and confidential valuations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportResultsCSV}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchResults}
            disabled={loading}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Active Rule Indicator */}
      <div className="rounded-xl border border-kiniro-500/40 bg-kiniro-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-kiniro-500/20 text-kiniro-400 flex items-center justify-center font-bold">
            判
          </div>
          <div>
            <div className="text-xs text-sumi-400">Active Official Winning Rule:</div>
            <div className="font-serif font-bold text-white text-sm">{ruleNames[activeRule]}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleToggleAnnouncement}
            disabled={announcing || !winner}
            className={
              isPublic
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
            }
          >
            <Megaphone className="h-4 w-4 mr-1.5" />
            {isPublic ? 'Revoke Public Announcement' : 'Announce Winner Officially'}
          </Button>
        </div>
      </div>

      {/* Winner Spotlight Card */}
      {winner && (
        <Card className="border-kiniro-500/60 bg-gradient-to-br from-sumi-900 via-sumi-900/90 to-kiniro-950/40 shadow-glow-gold overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-kiniro-400 via-torii-500 to-kiniro-400" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-kiniro-500/20 text-kiniro-400 flex items-center justify-center mb-2 animate-bounce">
              <Crown className="h-9 w-9" />
            </div>
            <Badge variant="gold" className="mx-auto text-xs px-3 py-1 font-bold">
              {isTie ? 'Declared Official Tie' : 'Official Auction Champion'}
            </Badge>
            <CardTitle className="text-3xl font-serif text-white mt-2">
              {winner.teamName}
            </CardTitle>
            <CardDescription className="text-sumi-300">
              Acquired {winner.placesPurchased} Japanese Landmarks
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="rounded-xl bg-sumi-950/80 border border-sumi-800 p-3 text-center">
                <span className="text-xs text-sumi-400">Total Actual Worth</span>
                <div className="font-serif font-bold text-lg text-emerald-400 mt-1">
                  {formatCurrency(winner.totalActualWorth, currency)}
                </div>
              </div>

              <div className="rounded-xl bg-sumi-950/80 border border-sumi-800 p-3 text-center">
                <span className="text-xs text-sumi-400">Total Spent</span>
                <div className="font-serif font-bold text-lg text-kiniro-400 mt-1">
                  {formatCurrency(winner.totalSpent, currency)}
                </div>
              </div>

              <div className="rounded-xl bg-sumi-950/80 border border-sumi-800 p-3 text-center">
                <span className="text-xs text-sumi-400">Total Savings</span>
                <div className="font-serif font-bold text-lg text-white mt-1">
                  {formatCurrency(winner.totalSavings, currency)}
                </div>
              </div>

              <div className="rounded-xl bg-sumi-950/80 border border-sumi-800 p-3 text-center">
                <span className="text-xs text-sumi-400">Value Efficiency</span>
                <div className="font-serif font-bold text-lg text-cyan-400 mt-1">
                  {formatPercentage(winner.valueEfficiency)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Results Table */}
      <Card className="border-sumi-800 bg-sumi-900/80 overflow-hidden shadow-sumi-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sumi-950 border-b border-sumi-800 text-sumi-400 font-serif text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Team Name</th>
                <th className="px-5 py-3.5">Places Bought</th>
                <th className="px-5 py-3.5">Confidential Actual Worth</th>
                <th className="px-5 py-3.5">Total Spent</th>
                <th className="px-5 py-3.5">Total Savings</th>
                <th className="px-5 py-3.5">Remaining Budget</th>
                <th className="px-5 py-3.5">Value Efficiency</th>
                <th className="px-5 py-3.5">Budget Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sumi-800/60">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sumi-400">
                    {loading ? 'Calculating event figures...' : 'No approved teams available to calculate results.'}
                  </td>
                </tr>
              ) : (
                results.map((team) => (
                  <tr
                    key={team.teamId}
                    className={`hover:bg-sumi-800/40 transition-colors ${
                      team.rank === 1 ? 'bg-kiniro-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      {team.rank === 1 ? (
                        <div className="h-7 w-7 rounded-full bg-kiniro-500 text-sumi-950 font-black flex items-center justify-center text-xs">
                          1
                        </div>
                      ) : team.rank === 2 ? (
                        <div className="h-7 w-7 rounded-full bg-sumi-300 text-sumi-950 font-bold flex items-center justify-center text-xs">
                          2
                        </div>
                      ) : team.rank === 3 ? (
                        <div className="h-7 w-7 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                          3
                        </div>
                      ) : (
                        <span className="text-sumi-400 pl-2">#{team.rank}</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-bold text-white">
                      {team.teamName}
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant="outline" className="border-sumi-700 text-sumi-300">
                        {team.placesPurchased} places
                      </Badge>
                    </td>

                    <td className="px-5 py-4 font-serif font-bold text-emerald-400">
                      {formatCurrency(team.totalActualWorth, currency)}
                    </td>

                    <td className="px-5 py-4 font-serif font-semibold text-kiniro-400">
                      {formatCurrency(team.totalSpent, currency)}
                    </td>

                    <td className="px-5 py-4 font-serif font-bold text-white">
                      {formatCurrency(team.totalSavings, currency)}
                    </td>

                    <td className="px-5 py-4 font-serif text-sumi-300">
                      {formatCurrency(team.remainingBudget, currency)}
                    </td>

                    <td className="px-5 py-4 font-serif text-cyan-400 font-semibold">
                      {formatPercentage(team.valueEfficiency)}
                    </td>

                    <td className="px-5 py-4 font-serif text-sumi-400">
                      {formatPercentage(team.budgetUtilization)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
