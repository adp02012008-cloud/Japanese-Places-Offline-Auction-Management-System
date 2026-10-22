'use client';

import React, { useEffect, useState } from 'react';
import {
  Gavel,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Coins,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  History,
  Landmark,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { IPlace, ITeam, IPurchase } from '@/types';

export default function AdminSalesPage() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Sale entry form state
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingPurchaseId, setCancellingPurchaseId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placesRes, teamsRes, salesRes] = await Promise.all([
        fetch('/api/admin/places'),
        fetch('/api/admin/teams'),
        fetch('/api/admin/sales'),
      ]);

      const placesData = await placesRes.json();
      const teamsData = await teamsRes.json();
      const salesData = await salesRes.json();

      setPlaces(placesData.places || []);
      setTeams(teamsData.teams || []);
      setPurchases(salesData.purchases || []);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unsoldPlaces = places.filter((p) => p.status === 'NOT_SOLD');
  const approvedTeams = teams.filter((t) => t.approvalStatus === 'APPROVED' && t.participationStatus === 'ACTIVE');

  const selectedPlace = places.find((p) => p._id === selectedPlaceId);
  const selectedTeam = teams.find((t) => t._id === selectedTeamId);

  // Automatically set final price default to starting price when place is chosen
  const handlePlaceSelect = (id: string) => {
    setSelectedPlaceId(id);
    const p = places.find((item) => item._id === id);
    if (p && finalPrice === 0) {
      setFinalPrice(p.startingPrice);
    }
  };

  const remainingAfterPurchase = selectedTeam
    ? selectedTeam.remainingBudget - (Number(finalPrice) || 0)
    : 0;

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!selectedPlace) {
      setActionError('Please select a Japanese place being sold.');
      return;
    }

    if (!selectedTeam) {
      setActionError('Please select the winning team.');
      return;
    }

    if (finalPrice <= 0 || isNaN(finalPrice)) {
      setActionError('Please enter a valid final purchase price greater than zero.');
      return;
    }

    if (selectedTeam.remainingBudget < finalPrice) {
      setActionError(
        `Insufficient budget! Team "${selectedTeam.teamName}" has only ${formatCurrency(
          selectedTeam.remainingBudget
        )} remaining, but the entered purchase price is ${formatCurrency(finalPrice)}.`
      );
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSale = async () => {
    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: selectedPlaceId,
          teamId: selectedTeamId,
          finalPurchasePrice: Number(finalPrice),
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || 'Failed to record purchase transaction.');
        setSubmitting(false);
        setIsConfirmOpen(false);
        return;
      }

      setIsConfirmOpen(false);
      setActionSuccess(
        `Sale confirmed! ${selectedPlace?.placeName} allocated to ${selectedTeam?.teamName} for ${formatCurrency(
          finalPrice
        )}.`
      );

      // Reset form
      setSelectedPlaceId('');
      setSelectedTeamId('');
      setFinalPrice(0);
      setNotes('');

      fetchData();
    } catch (err) {
      setActionError('Network error executing purchase transaction.');
      setIsConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openCancelModal = (purchaseId: string) => {
    setCancellingPurchaseId(purchaseId);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleExecuteCancel = async () => {
    if (!cancellingPurchaseId || !cancelReason.trim()) {
      alert('Please state a valid reason for cancelling this sale.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/sales/${cancellingPurchaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel sale.');
        return;
      }

      setIsCancelModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Network error cancelling sale.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Live Offline Sale Recording</h2>
          <p className="text-sm text-sumi-400">
            Record physical room bids with atomic multi-document transaction and balance deduction.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </Button>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-4 flex items-center space-x-3 text-emerald-300">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl bg-destructive/20 border border-destructive/40 p-4 flex items-center space-x-3 text-rose-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">{actionError}</span>
        </div>
      )}

      {/* Sale Entry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-sumi-800 bg-sumi-900/90 shadow-sumi-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-torii-600 to-kiniro-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl text-white flex items-center gap-2">
                <Gavel className="h-5 w-5 text-torii-500" />
                <span>Confirm Offline Bidding Outcome</span>
              </CardTitle>
              <Badge variant="gold" className="text-xs">
                {unsoldPlaces.length} Unsold Places Available
              </Badge>
            </div>
            <CardDescription className="text-sumi-400">
              Select the landmark hammered down in the room, choose the winning team, and enter the agreed price.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleValidateAndOpenConfirm}>
            <CardContent className="space-y-5">
              {/* Select Place */}
              <div className="space-y-1.5">
                <Label htmlFor="place-select" className="text-xs text-sumi-300 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-torii-400" />
                  <span>Select Japanese Landmark <span className="text-torii-400">*</span></span>
                </Label>
                <select
                  id="place-select"
                  value={selectedPlaceId}
                  onChange={(e) => handlePlaceSelect(e.target.value)}
                  required
                  className="w-full rounded-lg border border-sumi-700 bg-sumi-950 p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-torii-500"
                >
                  <option value="">-- Choose from {unsoldPlaces.length} available places --</option>
                  {unsoldPlaces.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.placeName} (Starting: {formatCurrency(p.startingPrice)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Winning Team */}
              <div className="space-y-1.5">
                <Label htmlFor="team-select" className="text-xs text-sumi-300 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-kiniro-400" />
                  <span>Winning Team <span className="text-torii-400">*</span></span>
                </Label>
                <select
                  id="team-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-sumi-700 bg-sumi-950 p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-torii-500"
                >
                  <option value="">-- Choose winning team --</option>
                  {approvedTeams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.teamName} — Balance: {formatCurrency(t.remainingBudget)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Final Purchase Price */}
              <div className="space-y-1.5">
                <Label htmlFor="final-price" className="text-xs text-sumi-300 flex items-center justify-between">
                  <span>Final Purchase Price (₹) <span className="text-torii-400">*</span></span>
                  {selectedPlace && (
                    <span className="text-xs text-sumi-500">
                      Starting Price: {formatCurrency(selectedPlace.startingPrice)}
                    </span>
                  )}
                </Label>
                <Input
                  id="final-price"
                  type="number"
                  min="0"
                  step="500"
                  placeholder="Enter final bid price"
                  value={finalPrice || ''}
                  onChange={(e) => setFinalPrice(Number(e.target.value))}
                  required
                  className="bg-sumi-950 border-sumi-700 text-white font-serif font-bold text-lg h-12"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs text-sumi-400">
                  Optional Sale Notes
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Competitive bid off against Team Fuji"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-sumi-950 border-sumi-700 text-white text-xs"
                />
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-torii-600 hover:bg-torii-700 text-white font-bold h-12 shadow-glow-torii"
                disabled={!selectedPlaceId || !selectedTeamId}
              >
                Review & Confirm Sale
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Calculation Preview Card */}
        <Card className="border-sumi-800 bg-sumi-900/70 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-sumi-800 pb-2">
              Transaction Impact Preview
            </h3>

            {selectedPlace ? (
              <div className="rounded-xl border border-sumi-800 bg-sumi-950 p-3 space-y-2">
                <div className="relative h-28 w-full rounded-lg overflow-hidden">
                  <img src={selectedPlace.imageUrl} alt={selectedPlace.placeName} className="w-full h-full object-cover" />
                </div>
                <div className="font-serif font-bold text-sm text-white">{selectedPlace.placeName}</div>
                <div className="text-xs text-sumi-400 line-clamp-2">{selectedPlace.description}</div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-sumi-500 border border-dashed border-sumi-800 rounded-lg">
                No place selected yet
              </div>
            )}

            {selectedTeam ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sumi-800/80">
                  <span className="text-sumi-400">Selected Team:</span>
                  <span className="font-bold text-white">{selectedTeam.teamName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sumi-800/80">
                  <span className="text-sumi-400">Current Balance:</span>
                  <span className="font-serif font-bold text-emerald-400">
                    {formatCurrency(selectedTeam.remainingBudget)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sumi-800/80">
                  <span className="text-sumi-400">Purchase Deduction:</span>
                  <span className="font-serif font-bold text-rose-400">
                    - {formatCurrency(finalPrice)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-bold">
                  <span className="text-sumi-300">Remaining After Sale:</span>
                  <span className={`font-serif ${remainingAfterPurchase < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {formatCurrency(remainingAfterPurchase)}
                  </span>
                </div>

                {remainingAfterPurchase < 0 && (
                  <div className="rounded-lg bg-rose-950/60 border border-rose-800 p-2 text-[11px] text-rose-300">
                    ⚠ Warning: Exceeds available budget by {formatCurrency(Math.abs(remainingAfterPurchase))}. Transaction will be rejected.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-sumi-500 border border-dashed border-sumi-800 rounded-lg">
                No team selected yet
              </div>
            )}
          </div>

          <div className="rounded-lg bg-sumi-950 p-3 text-[11px] text-sumi-400 space-y-1">
            <div className="text-kiniro-400 font-semibold">Atomic Consistency:</div>
            <div>All changes execute inside a single MongoDB session. If budget verification fails, zero data is altered.</div>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="border-sumi-800 bg-sumi-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-white">
              Confirm Offline Purchase
            </DialogTitle>
            <DialogDescription className="text-sumi-400">
              Please verify all details before executing the atomic sale transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-sm">
            <div className="rounded-lg bg-sumi-950 p-3 border border-sumi-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-sumi-400">Landmark:</span>
                <span className="font-bold text-white">{selectedPlace?.placeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sumi-400">Winning Team:</span>
                <span className="font-bold text-white">{selectedTeam?.teamName}</span>
              </div>
              <div className="flex justify-between border-t border-sumi-800 pt-2">
                <span className="text-sumi-400">Previous Budget:</span>
                <span className="font-serif text-sumi-300">{formatCurrency(selectedTeam?.remainingBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sumi-400">Hammered Price:</span>
                <span className="font-serif font-bold text-torii-400">{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-sumi-800 pt-2 font-bold">
                <span className="text-sumi-300">New Remaining Budget:</span>
                <span className="font-serif text-emerald-400">{formatCurrency(remainingAfterPurchase)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={submitting}
              className="border-sumi-700 hover:bg-sumi-800 text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSale}
              disabled={submitting}
              className="bg-torii-600 hover:bg-torii-700 text-white font-bold"
            >
              {submitting ? 'Executing Transaction...' : 'Confirm & Deduct Balance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmed Purchases Table / Ledger */}
      <div className="space-y-3 pt-4">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-kiniro-400" />
          <span>Recorded Offline Purchases Ledger</span>
        </h3>

        <Card className="border-sumi-800 bg-sumi-900/80 overflow-hidden shadow-sumi-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sumi-950 border-b border-sumi-800 text-sumi-400 font-serif text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Place Name</th>
                  <th className="px-6 py-3.5">Winning Team</th>
                  <th className="px-6 py-3.5">Purchase Price</th>
                  <th className="px-6 py-3.5">Confidential Actual Worth</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sumi-800/60">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sumi-400">
                      No purchases recorded yet. Complete offline bidding for a place above.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-sumi-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {p.placeName}
                      </td>
                      <td className="px-6 py-4 text-sumi-200">
                        {p.teamName}
                      </td>
                      <td className="px-6 py-4 font-serif font-bold text-torii-400">
                        {formatCurrency(p.finalPurchasePrice)}
                      </td>
                      <td className="px-6 py-4 font-serif font-semibold text-kiniro-400">
                        {formatCurrency(p.actualWorthAtSale)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={p.status === 'CONFIRMED' ? 'available' : 'sold'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-sumi-400">
                        {new Date(p.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openCancelModal(p._id)}
                            className="text-xs h-7"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Cancel Sale
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cancellation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="border-sumi-800 bg-sumi-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <span>Cancel Confirmed Sale</span>
            </DialogTitle>
            <DialogDescription className="text-sumi-400">
              Cancelling will refund the team's balance, restore the place to unsold inventory, and log this action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason" className="text-xs text-sumi-300">
              Reason for Cancellation <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="cancel-reason"
              placeholder="e.g. Accidental click, team retracted bid, rule dispute"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="bg-sumi-950 border-sumi-700 text-white"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              className="border-sumi-700 hover:bg-sumi-800 text-white"
            >
              Abort
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleExecuteCancel}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
