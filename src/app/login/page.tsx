'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function TeamLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both team username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          type: 'team',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials. Please verify your team login.');
        setLoading(false);
        return;
      }

      // Redirect to team dashboard
      router.push('/team/dashboard');
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-washi-100 dark:bg-sumi-950 text-sumi-900 dark:text-sumi-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-japanese-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-torii-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Portal
        </Link>

        <Card className="border-border/80 bg-card/95 shadow-sumi-md overflow-hidden">
          <div className="h-2 bg-torii-600" />

          <CardHeader className="text-center space-y-1">
            <div className="mx-auto h-12 w-12 rounded-xl bg-torii-50 dark:bg-torii-950 flex items-center justify-center text-torii-600 mb-2">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-serif">Team Portal Login</CardTitle>
            <CardDescription>
              Log in to view your team's remaining budget, purchased landmarks, and catalogue.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-start space-x-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Team Username / ID</Label>
                <Input
                  id="username"
                  placeholder="e.g. team_sakura_101"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-torii-600 hover:bg-torii-700 text-white font-semibold shadow-glow-torii h-11"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Team Dashboard'}
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-1">
                Haven't registered your team yet?{' '}
                <Link href="/register" className="text-torii-600 font-semibold hover:underline">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
