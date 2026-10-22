'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Download,
  AlertCircle,
  RefreshCw,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency, formatPercentage, convertToCSV } from '@/lib/utils';
import { ITeam, ITeamMember } from '@/types';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected team for details modal
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<ITeamMember[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teams?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams();
  };

  const handleStatusUpdate = async (teamId: string, approvalStatus: string) => {
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, approvalStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeams();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openTeamDetails = async (team: ITeam) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/${team._id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Team ID',
      'Team Name',
      'Username',
      'Approval Status',
      'Participation',
      'Member Count',
      'Starting Budget',
      'Remaining Budget',
      'Total Spent',
      'Actual Worth Acquired',
      'Created At',
    ];

    const rows = teams.map((t) => [
      t._id,
      t.teamName,
      t.username || '',
      t.approvalStatus,
      t.participationStatus,
      t.memberCount,
      t.startingBudget,
      t.remainingBudget,
      t.totalSpent,
      t.totalActualWorth,
      new Date(t.createdAt).toLocaleString(),
    ]);

    const csvContent = convertToCSV(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `japanese_auction_teams_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Team Management</h2>
          <p className="text-sm text-sumi-400">
            Review public registrations, approve participants, inspect member rosters, and monitor balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTeams}
            disabled={loading}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-sumi-800 bg-sumi-900/60 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-sumi-400" />
              <Input
                placeholder="Search teams by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-sumi-950 border-sumi-700 text-white"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-sumi-800 text-white hover:bg-sumi-700">
              Search
            </Button>
          </form>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                onClick={() => setStatusFilter(st)}
                className={`text-xs ${
                  statusFilter === st
                    ? 'bg-torii-600 text-white'
                    : 'border-sumi-800 text-sumi-400 hover:bg-sumi-800 hover:text-white'
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Teams Table */}
      <Card className="border-sumi-800 bg-sumi-900/80 overflow-hidden shadow-sumi-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sumi-950 border-b border-sumi-800 text-sumi-400 font-serif text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Team Name</th>
                <th className="px-6 py-3.5">Members</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Remaining Budget</th>
                <th className="px-6 py-3.5">Total Spent</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sumi-800/60">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sumi-400">
                    {loading ? 'Loading teams...' : 'No teams match the selected filter.'}
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team._id} className="hover:bg-sumi-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{team.teamName}</div>
                      <div className="text-xs text-sumi-400 font-mono">@{team.username}</div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-sumi-700 text-sumi-300">
                        {team.memberCount} members
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          team.approvalStatus === 'APPROVED'
                            ? 'available'
                            : team.approvalStatus === 'PENDING'
                            ? 'withdrawn'
                            : 'sold'
                        }
                      >
                        {team.approvalStatus}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-serif font-bold text-emerald-400">
                        {formatCurrency(team.remainingBudget)}
                      </div>
                      <div className="text-[11px] text-sumi-500">
                        Starting: {formatCurrency(team.startingBudget)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-serif font-semibold text-kiniro-400">
                        {formatCurrency(team.totalSpent)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTeamDetails(team)}
                        className="border-sumi-700 hover:bg-sumi-800 text-sumi-200 text-xs h-8"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>

                      {team.approvalStatus === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(team._id, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(team._id, 'REJECTED')}
                            className="text-xs h-8"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Member Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-sumi-800 bg-sumi-900 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-white flex items-center justify-between">
              <span>{selectedTeam?.teamName}</span>
              <Badge variant="gold" className="text-xs">
                {selectedTeam?.approvalStatus}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sumi-400">
              Registered Team ID: {selectedTeam?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-sumi-950 border border-sumi-800 text-xs">
              <div>
                <span className="text-sumi-400">Remaining Budget:</span>
                <div className="font-serif font-bold text-base text-emerald-400">
                  {formatCurrency(selectedTeam?.remainingBudget)}
                </div>
              </div>
              <div>
                <span className="text-sumi-400">Total Spent:</span>
                <div className="font-serif font-bold text-base text-kiniro-400">
                  {formatCurrency(selectedTeam?.totalSpent)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-sumi-300">
                Team Member Roster ({selectedMembers.length} Verified)
              </h4>

              {modalLoading ? (
                <div className="py-6 text-center text-sumi-400 text-sm">Loading member records...</div>
              ) : selectedMembers.length === 0 ? (
                <div className="py-4 text-center text-sumi-400 text-xs">No members found.</div>
              ) : (
                <div className="divide-y divide-sumi-800 rounded-lg border border-sumi-800 bg-sumi-950/60 overflow-hidden">
                  {selectedMembers.map((m, idx) => (
                    <div key={m._id || idx} className="p-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-white">{m.fullName}</div>
                        <div className="text-xs text-sumi-400 font-mono">
                          Enrollment: <strong className="text-sumi-200">{m.enrollmentNumber}</strong>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-sumi-700 text-[10px]">
                        Member #{idx + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-sumi-700 hover:bg-sumi-800 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
