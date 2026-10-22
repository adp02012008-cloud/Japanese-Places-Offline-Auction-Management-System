'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle2, AlertCircle, Sparkles, KeyRound, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface MemberEntry {
  fullName: string;
  enrollmentNumber: string;
}

export default function RegisterPage() {
  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState<number>(3);
  const [members, setMembers] = useState<MemberEntry[]>([
    { fullName: '', enrollmentNumber: '' },
    { fullName: '', enrollmentNumber: '' },
    { fullName: '', enrollmentNumber: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    teamName: string;
    approvalStatus: string;
    credentials?: { username: string; temporaryPassword: string };
    message: string;
  } | null>(null);

  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Handle changing member count dynamically
  const handleCountChange = (count: number) => {
    if (count < 1 || count > 8) return;
    setMemberCount(count);

    const newMembers = [...members];
    if (count > members.length) {
      for (let i = members.length; i < count; i++) {
        newMembers.push({ fullName: '', enrollmentNumber: '' });
      }
    } else {
      newMembers.length = count;
    }
    setMembers(newMembers);
  };

  const updateMember = (index: number, field: keyof MemberEntry, val: string) => {
    const updated = [...members];
    updated[index][field] = val;
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Frontend validations
    if (!teamName.trim()) {
      setErrorMessage('Please enter your team name.');
      return;
    }

    const seenEnrollments = new Set<string>();
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName.trim()) {
        setErrorMessage(`Please enter the full name for Member #${i + 1}.`);
        return;
      }
      if (!m.enrollmentNumber.trim()) {
        setErrorMessage(`Please enter the enrollment number for Member #${i + 1}.`);
        return;
      }
      const enroll = m.enrollmentNumber.trim().toUpperCase();
      if (seenEnrollments.has(enroll)) {
        setErrorMessage(`Duplicate enrollment number "${enroll}" entered for multiple members.`);
        return;
      }
      seenEnrollments.add(enroll);
    }

    setLoading(true);

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          memberCount,
          members,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit registration. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessData({
        teamName: data.teamName,
        approvalStatus: data.approvalStatus,
        credentials: data.credentials,
        message: data.message,
      });
    } catch (err) {
      setErrorMessage('Network error communicating with the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-washi-100 dark:bg-sumi-950 text-sumi-900 dark:text-sumi-100 py-10 px-4">
      {/* Background Japanese Aesthetic Texture */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-torii-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Portal
        </Link>

        {successData ? (
          /* Success Screen */
          <Card className="border-emerald-200 dark:border-emerald-900 bg-card/95 shadow-sumi-md overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-kiniro-500 to-torii-500" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <CardTitle className="text-2xl font-serif text-foreground">
                Registration Confirmed!
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Team <span className="font-semibold text-foreground">"{successData.teamName}"</span> has been successfully recorded.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <div className="rounded-xl bg-washi-200/60 dark:bg-sumi-900/60 p-4 border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge variant={successData.approvalStatus === 'APPROVED' ? 'available' : 'withdrawn'} className="mt-1">
                    {successData.approvalStatus === 'APPROVED' ? 'Approved & Ready' : 'Pending Administrator Approval'}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Configured Starting Budget</div>
                  <div className="font-serif font-bold text-lg text-emerald-600">₹100,000</div>
                </div>
              </div>

              {successData.credentials && (
                <div className="rounded-xl border border-kiniro-300 dark:border-kiniro-800 bg-kiniro-50/50 dark:bg-kiniro-950/40 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-kiniro-900 dark:text-kiniro-200 font-semibold text-sm">
                    <KeyRound className="h-4 w-4 text-kiniro-600" />
                    <span>Your Team Dashboard Credentials</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save these credentials. You can use them to log into your team dashboard and check your remaining balance and acquired places.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-background rounded-lg p-3 border border-border flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Team Username</div>
                        <div className="font-mono font-bold text-sm">{successData.credentials.username}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(successData.credentials!.username);
                          setCopiedUser(true);
                          setTimeout(() => setCopiedUser(false), 2000);
                        }}
                      >
                        {copiedUser ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="bg-background rounded-lg p-3 border border-border flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Temporary Password</div>
                        <div className="font-mono font-bold text-sm">{successData.credentials.temporaryPassword}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(successData.credentials!.temporaryPassword);
                          setCopiedPass(true);
                          setTimeout(() => setCopiedPass(false), 2000);
                        }}
                      >
                        {copiedPass ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/login" className="w-full sm:w-1/2">
                <Button className="w-full bg-torii-600 hover:bg-torii-700 text-white">
                  Proceed to Team Login
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-1/2"
                onClick={() => {
                  setSuccessData(null);
                  setTeamName('');
                  setMembers([
                    { fullName: '', enrollmentNumber: '' },
                    { fullName: '', enrollmentNumber: '' },
                    { fullName: '', enrollmentNumber: '' },
                  ]);
                }}
              >
                Register Another Team
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* Registration Form */
          <Card className="border-border/80 bg-card/95 shadow-sumi-md overflow-hidden">
            <div className="h-2 bg-torii-600" />

            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="gold" className="text-[10px] tracking-wider uppercase font-semibold">
                  Official Registration
                </Badge>
                <span className="text-xs text-muted-foreground font-serif">参加登録</span>
              </div>
              <CardTitle className="text-2xl font-serif">
                Japanese Places Auction — Team Registration
              </CardTitle>
              <CardDescription>
                Submit your team information and member details to receive an equal offline auction starting budget.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {errorMessage && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3.5 flex items-start space-x-2.5 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="font-semibold text-sm flex items-center justify-between">
                    <span>Team Name <span className="text-torii-600">*</span></span>
                    <span className="text-xs text-muted-foreground font-normal">Case-insensitive unique</span>
                  </Label>
                  <Input
                    id="teamName"
                    placeholder="e.g. Team Sakura, Shogun Tigers, Kyoto Explorers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base"
                  />
                </div>

                {/* Member Count Selector */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm flex items-center justify-between">
                    <span>Number of Team Members <span className="text-torii-600">*</span></span>
                    <span className="text-xs text-muted-foreground font-normal">{memberCount} member sections</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={memberCount === num ? 'default' : 'outline'}
                        className={`h-10 w-12 text-sm font-semibold ${
                          memberCount === num ? 'bg-torii-600 text-white' : ''
                        }`}
                        onClick={() => handleCountChange(num)}
                        disabled={loading}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Member Sections */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                    <Users className="h-4 w-4 text-torii-600" />
                    <h4 className="font-serif font-bold text-sm tracking-wide">
                      Team Member Details
                    </h4>
                  </div>

                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border/70 bg-washi-50/50 dark:bg-sumi-900/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-muted-foreground uppercase tracking-wider">
                          Member #{index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`name-${index}`} className="text-xs">
                            Full Name <span className="text-torii-600">*</span>
                          </Label>
                          <Input
                            id={`name-${index}`}
                            placeholder="e.g. Kenji Tanaka"
                            value={member.fullName}
                            onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`enroll-${index}`} className="text-xs">
                            Enrollment / Student ID <span className="text-torii-600">*</span>
                          </Label>
                          <Input
                            id={`enroll-${index}`}
                            placeholder="e.g. ENR2026-042"
                            value={member.enrollmentNumber}
                            onChange={(e) => updateMember(index, 'enrollmentNumber', e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-torii-600 hover:bg-torii-700 text-white font-semibold shadow-glow-torii"
                  disabled={loading}
                >
                  {loading ? 'Submitting Registration...' : 'Complete Team Registration'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
