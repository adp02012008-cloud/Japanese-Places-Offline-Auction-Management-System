import Link from 'next/link';
import { Users, ShieldCheck, MonitorPlay, Sparkles, Building2, Landmark, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-washi-100 dark:bg-sumi-950 text-sumi-900 dark:text-sumi-100">
      {/* Decorative Traditional Japanese Motif Overlay */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-40 pointer-events-none" />

      {/* Floating subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-torii-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-kiniro-500/15 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-torii-600 text-white flex items-center justify-center shadow-glow-torii font-serif font-black text-lg">
            鳥
          </div>
          <div>
            <div className="font-serif font-bold text-lg leading-tight tracking-wide flex items-center gap-2">
              <span>Japanese Places Auction</span>
              <Badge variant="gold" className="text-[10px] tracking-widest px-2 py-0 uppercase">
                Offline Event
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              日本名所競売管理システム • Physical Live Bidding System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="font-medium">
              Team Login
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="default" size="sm" className="font-medium bg-sumi-900 hover:bg-sumi-800 text-white">
              Admin Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-torii-50 dark:bg-torii-950/60 border border-torii-200 dark:border-torii-800 text-torii-700 dark:text-torii-300 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Offline Auction Management Engine</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-sumi-900 dark:text-washi-50 leading-tight">
            Acquire Iconic <span className="text-torii-600 underline decoration-kiniro-500/50 decoration-wavy">Japanese Landmarks</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage physical live bidding across famous castles, sacred shrines, temples, and natural wonders.
            Real-time multi-document balance deduction, confidential actual valuations, and projector display.
          </p>

          {/* Quick Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-torii-600 hover:bg-torii-700 text-white px-8 h-13 shadow-glow-torii text-base">
                <Users className="h-5 w-5 mr-2" />
                Register Your Team
              </Button>
            </Link>

            <Link href="/presentation" target="_blank">
              <Button size="lg" variant="gold" className="px-8 h-13 text-base shadow-glow-gold">
                <MonitorPlay className="h-5 w-5 mr-2" />
                Launch 16:9 Presentation
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16 text-left">
          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-torii-400 transition-all hover:shadow-sumi-md">
            <CardContent className="p-6 space-y-3">
              <div className="h-11 w-11 rounded-lg bg-torii-50 dark:bg-torii-950 flex items-center justify-center text-torii-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Equal Team Budgets</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Teams register dynamically with member enrollment numbers. Admins allocate equal starting capital (₹100,000 standard).
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-kiniro-400 transition-all hover:shadow-sumi-md">
            <CardContent className="p-6 space-y-3">
              <div className="h-11 w-11 rounded-lg bg-kiniro-50 dark:bg-kiniro-950 flex items-center justify-center text-kiniro-600">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Confidential Valuations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Secret actual-worth benchmarks remain hidden from the audience, calculating true savings and value efficiency automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-emerald-400 transition-all hover:shadow-sumi-md">
            <CardContent className="p-6 space-y-3">
              <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Atomic Multi-Doc Safety</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Atomic PostgreSQL safety: zero duplicate sales, instant budget deductions, and audit logging for every bid recorded.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground bg-background/50">
        <p>© 2026 Japanese Places Offline Auction System. Powered by Next.js, Supabase Database & Storage.</p>
        <p className="mt-1">Strict offline physical bidding policy enforced — no online client-side bids.</p>
      </footer>
    </div>
  );
}
