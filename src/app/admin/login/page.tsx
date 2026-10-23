'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter administrator username and password.');
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
          type: 'admin',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Administrator credentials invalid.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-sumi-950 text-sumi-100 flex items-center justify-center p-4">
      {/* Dark Japanese Sumi Aesthetic Texture */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-torii-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Portal
        </Link>

        <Card className="border-sumi-800 bg-sumi-900/90 backdrop-blur-md shadow-sumi-lg overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-torii-600 via-kiniro-500 to-torii-600" />

          <CardHeader className="text-center space-y-1">
            <div className="mx-auto h-12 w-12 rounded-xl bg-sumi-800 border border-sumi-700 flex items-center justify-center text-kiniro-400 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-serif text-white">Administrator Portal</CardTitle>
            <CardDescription className="text-sumi-400">
              Restricted management portal for the offline Japanese places auction.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-destructive/20 border border-destructive/40 p-3 flex items-start space-x-2 text-sm text-destructive-foreground">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-username" className="text-sumi-300">
                  Admin Username
                </Label>
                <Input
                  id="admin-username"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-sumi-950 border-sumi-700 text-white focus-visible:ring-kiniro-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sumi-300">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-sumi-950 border-sumi-700 text-white focus-visible:ring-kiniro-500"
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                variant="gold"
                className="w-full text-sumi-950 font-bold h-11"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Management Console'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
