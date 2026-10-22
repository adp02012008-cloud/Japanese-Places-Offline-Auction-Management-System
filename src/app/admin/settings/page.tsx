'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { WinningRule } from '@/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [eventName, setEventName] = useState('Japanese Places Offline Auction 2026');
  const [startingBudget, setStartingBudget] = useState<number>(100000);
  const [currency, setCurrency] = useState('₹');
  const [activeWinningRule, setActiveWinningRule] = useState<WinningRule>('SAVINGS');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [requireAdminApproval, setRequireAdminApproval] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setEventName(s.eventName || '');
          setStartingBudget(s.startingBudgetPerTeam || 100000);
          setCurrency(s.currency || '₹');
          setActiveWinningRule(s.activeWinningRule || 'SAVINGS');
          setIsRegistrationOpen(s.isRegistrationOpen ?? true);
          setRequireAdminApproval(s.requireAdminApproval ?? true);
        }
      })
      .catch((err) => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName.trim(),
          startingBudgetPerTeam: Number(startingBudget),
          currency: currency.trim(),
          activeWinningRule,
          isRegistrationOpen,
          requireAdminApproval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
      } else {
        setMessage({ type: 'success', text: 'Event settings updated and logged successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-kiniro-400" />
          <span>Event Settings & Scoring Configuration</span>
        </h2>
        <p className="text-sm text-sumi-400">
          Control starting budgets, official winner calculation rules, currencies, and registration statuses.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 flex items-center space-x-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-destructive/20 border border-destructive/40 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Card className="border-sumi-800 bg-sumi-900/90 shadow-sumi-md overflow-hidden">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-xl font-serif text-white">General Parameters</CardTitle>
            <CardDescription className="text-sumi-400">
              Changes are immediately applied to new registrations and logged in the audit trail.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Event Name */}
            <div className="space-y-1.5">
              <Label htmlFor="eventName" className="text-xs text-sumi-300">
                Event Name
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="bg-sumi-950 border-sumi-700 text-white"
              />
            </div>

            {/* Currency & Starting Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs text-sumi-300">
                  Currency Symbol
                </Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                  className="bg-sumi-950 border-sumi-700 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startingBudget" className="text-xs text-sumi-300">
                  Starting Budget Per Team ({currency})
                </Label>
                <Input
                  id="startingBudget"
                  type="number"
                  min="0"
                  step="5000"
                  value={startingBudget}
                  onChange={(e) => setStartingBudget(Number(e.target.value))}
                  required
                  className="bg-sumi-950 border-sumi-700 text-white font-serif font-bold"
                />
              </div>
            </div>

            {/* Winning Rule Configuration */}
            <div className="space-y-2 pt-2 border-t border-sumi-800/80">
              <Label className="text-xs text-kiniro-400 font-semibold uppercase tracking-wider">
                Official Winning Rule Determination
              </Label>
              <p className="text-xs text-sumi-400">
                Select the metric that governs the tournament winner announced to teams:
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {[
                  {
                    id: 'SAVINGS',
                    name: 'Highest Total Savings (Default)',
                    desc: 'Winner has largest positive difference between actual worth acquired and total spent.',
                  },
                  {
                    id: 'EFFICIENCY',
                    name: 'Highest Value Efficiency',
                    desc: 'Winner achieves highest return ratio ((Actual Worth ÷ Total Spent) × 100).',
                  },
                  {
                    id: 'ACTUAL_WORTH',
                    name: 'Highest Total Actual Worth',
                    desc: 'Winner accumulates greatest combined actual worth within their budget.',
                  },
                ].map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => setActiveWinningRule(rule.id as WinningRule)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      activeWinningRule === rule.id
                        ? 'border-kiniro-500 bg-kiniro-950/40 text-white shadow-glow-gold'
                        : 'border-sumi-800 bg-sumi-950/60 text-sumi-300 hover:border-sumi-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{rule.name}</span>
                      {activeWinningRule === rule.id && (
                        <Badge variant="gold" className="text-[10px]">
                          Active Rule
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-sumi-400 mt-1">{rule.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Toggles */}
            <div className="space-y-3 pt-2 border-t border-sumi-800/80">
              <div className="flex items-center justify-between p-3 rounded-lg bg-sumi-950 border border-sumi-800">
                <div>
                  <div className="font-semibold text-sm text-white">Public Team Registration</div>
                  <div className="text-xs text-sumi-400">Allow new teams to submit registrations via /register</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isRegistrationOpen ? 'default' : 'outline'}
                  onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                  className={isRegistrationOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-sumi-700'}
                >
                  {isRegistrationOpen ? 'Open' : 'Closed'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-sumi-950 border border-sumi-800">
                <div>
                  <div className="font-semibold text-sm text-white">Require Administrator Approval</div>
                  <div className="text-xs text-sumi-400">Registrations start as PENDING until approved by admin</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={requireAdminApproval ? 'default' : 'outline'}
                  onClick={() => setRequireAdminApproval(!requireAdminApproval)}
                  className={requireAdminApproval ? 'bg-kiniro-600 hover:bg-kiniro-700 text-white' : 'border-sumi-700'}
                >
                  {requireAdminApproval ? 'Enabled' : 'Auto-Approve'}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="bg-torii-600 hover:bg-torii-700 text-white font-semibold shadow-glow-torii"
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? 'Saving Settings...' : 'Save Configuration'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
