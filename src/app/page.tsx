'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  MonitorPlay,
  Sparkles,
  Landmark,
  Crown,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Gavel,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Japanese3DAtmosphere from '@/components/Japanese3DAtmosphere';
import MovingPlacesBackground from '@/components/MovingPlacesBackground';
import { formatCurrency } from '@/lib/utils';
import { IPlace } from '@/types';

export default function HomePage() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold'>('all');

  useEffect(() => {
    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.places) {
          setPlaces(data.places);
        }
      })
      .catch(() => {});
  }, []);

  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 12; // -6deg to +6deg
    const y = (clientY / window.innerHeight - 0.5) * -12;
    setMouseTilt({ x, y });
  };

  const displayedCatalogue = places;

  return (
    <div
      onMouseMove={handleHeroMouseMove}
      className="relative min-h-screen bg-[#07070a] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-torii-600 selection:text-white"
    >
      {/* 1. Cinematic Moving Japanese Places Background */}
      <MovingPlacesBackground places={places} />

      {/* 2. Interactive 3D Japanese Atmosphere: 3D Lanterns, Golden Embers & Parallax Petals */}
      <Japanese3DAtmosphere />

      {/* 3. Decorative Vertical Japanese Calligraphy Sidebars */}
      <div className="hidden 2xl:flex fixed left-6 top-1/3 z-20 flex-col items-center space-y-4 pointer-events-none select-none opacity-40">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-torii-500 to-transparent" />
        <div className="[writing-mode:vertical-rl] font-serif tracking-[0.4em] text-xs text-kiniro-300 font-bold uppercase">
          日本名所競売祭 • TRADITION & GLORY
        </div>
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-torii-500 to-transparent" />
      </div>

      <div className="hidden 2xl:flex fixed right-6 top-1/3 z-20 flex-col items-center space-y-4 pointer-events-none select-none opacity-40">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-kiniro-500 to-transparent" />
        <div className="[writing-mode:vertical-rl] font-serif tracking-[0.4em] text-xs text-torii-400 font-bold uppercase">
          武士道 • STRATEGY & DISCIPLINE
        </div>
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-kiniro-500 to-transparent" />
      </div>

      {/* 4. Top Japanese Navigation Header */}
      <header className="relative z-30 border-b border-white/10 bg-[#07070a]/75 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-torii-600 to-torii-700 text-white flex items-center justify-center shadow-glow-torii font-serif font-black text-xl border border-torii-400/40 transition-transform group-hover:scale-105">
              鳥
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-torii-600/30 blur-sm -z-10 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg lg:text-xl leading-tight tracking-wider text-white flex items-center gap-2.5">
              <span>Japanese Places Auction</span>
              <Badge variant="gold" className="text-[10px] tracking-widest px-2.5 py-0.5 uppercase font-bold shadow-md">
                Offline Live
              </Badge>
            </div>
            <p className="text-[11px] text-sumi-300 font-sans tracking-wide">
              日本名所競売管理システム • Physical Room Auction System
            </p>
          </div>
        </div>

        {/* Action Controls & Portals */}
        <div className="flex items-center space-x-3">

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/5 hover:bg-white/15 text-white font-medium text-xs sm:text-sm h-9"
            >
              Team Login
            </Button>
          </Link>

          <Link href="/admin/login">
            <Button
              size="sm"
              className="bg-gradient-to-r from-torii-600 to-rose-600 hover:from-torii-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm h-9 shadow-glow-torii"
            >
              Admin Console
            </Button>
          </Link>
        </div>
      </header>

      {/* 5. Main Hero Section with Dynamic Calligraphy Banner */}
      <main className="relative z-20 container mx-auto px-6 py-12 lg:py-20 flex-1 flex flex-col items-center justify-center text-center [perspective:1200px]">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-torii-950/80 via-sumi-900/90 to-kiniro-950/80 border border-torii-500/40 text-torii-300 text-xs sm:text-sm font-semibold tracking-wide shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="h-4 w-4 text-kiniro-400 animate-spin" />
          <span>Official Offline Japanese Landmark Auction • 2026 Season</span>
          <span className="hidden sm:inline text-kiniro-400 font-serif">競売開催</span>
        </div>

        {/* Hero Title with 3D Holographic Perspective Tilt */}
        <div
          style={{
            transform: `perspective(1000px) rotateY(${mouseTilt.x}deg) rotateX(${mouseTilt.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.12s ease-out',
          }}
          className="max-w-4xl space-y-6 mt-6"
        >
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] drop-shadow-2xl">
            Acquire Iconic <br className="hidden sm:inline" />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-torii-500 via-rose-400 to-kiniro-400">
              Japanese Landmarks
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-torii-500 via-kiniro-400 to-transparent rounded-full shadow-glow-torii" />
            </span>
          </h1>

          <p className="text-base sm:text-xl text-sumi-200 max-w-2xl mx-auto leading-relaxed font-sans font-normal pt-2 drop-shadow-md">
            Manage physical room bidding across sacred shrines, golden pavilions, feudal castles, and emerald bamboo pathways. 
            Powered by atomic balance deductions, confidential actual worth, and theatrical 16:9 projector displays.
          </p>

          {/* Core Action CTA Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-torii-600 via-rose-600 to-torii-700 hover:from-torii-500 hover:to-rose-500 text-white font-bold px-8 h-14 shadow-glow-torii text-base rounded-2xl border border-torii-400/40 transition-all hover:scale-105"
              >
                <Users className="h-5 w-5 mr-2.5" />
                Register Your Team
              </Button>
            </Link>

            <Link href="/presentation" target="_blank">
              <Button
                size="lg"
                variant="gold"
                className="px-8 h-14 text-base font-bold rounded-2xl shadow-glow-gold border border-kiniro-400/50 transition-all hover:scale-105"
              >
                <MonitorPlay className="h-5 w-5 mr-2.5" />
                Launch 16:9 Theater View
              </Button>
            </Link>

            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/15 text-white font-medium px-6 h-14 text-base rounded-2xl backdrop-blur-md transition-all hover:scale-105"
              >
                <Users className="h-5 w-5 mr-2" />
                Team Portal Login
              </Button>
            </Link>
          </div>
        </div>

        {/* 6. Live Auction Highlights Bar */}
        <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <div className="text-xs text-kiniro-400 uppercase tracking-widest font-mono">Equal Capital</div>
            <div className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">₹1,00,000</div>
            <div className="text-[11px] text-sumi-300 mt-0.5">Starting team budget</div>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <div className="text-xs text-torii-400 uppercase tracking-widest font-mono">Historic Relics</div>
            <div className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">
              {places.length > 0 ? `${places.length} Places` : '0 Places'}
            </div>
            <div className="text-[11px] text-sumi-300 mt-0.5">Iconic Japanese landmarks</div>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <div className="text-xs text-emerald-400 uppercase tracking-widest font-mono">Integrity</div>
            <div className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">100% Offline</div>
            <div className="text-[11px] text-sumi-300 mt-0.5">Physical hammer bidding</div>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg">
            <div className="text-xs text-cyan-400 uppercase tracking-widest font-mono">Stage Feed</div>
            <div className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">16:9 Theater</div>
            <div className="text-[11px] text-sumi-300 mt-0.5">Projector big-screen ready</div>
          </div>
        </div>

        {/* 7. Japanese Landmark Catalogue Showcase */}
        <div className="w-full max-w-6xl mt-20 text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-kiniro-400 uppercase tracking-widest">
                <Compass className="h-3.5 w-3.5" />
                <span>Featured Catalogue</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Sacred Japanese Relics Up for Auction
              </h2>
            </div>

            <Link href="/presentation" className="text-xs font-bold text-kiniro-400 hover:text-kiniro-300 flex items-center gap-1 group">
              <span>View in 16:9 Stage Presentation</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Landmark Cards Grid or Clean Empty State */}
          {displayedCatalogue.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCatalogue.slice(0, 6).map((item: any, idx: number) => {
                const name = item.placeName || item.name;
                const price = item.startingPrice || 25000;
                const img = item.imageUrl || item.image_url;
                const status = item.status || 'NOT_SOLD';
                const winningTeam = item.winningTeamName;

                return (
                  <div
                    key={idx}
                    className="group relative rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-md overflow-hidden hover:border-torii-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-torii-900/30 flex flex-col justify-between"
                  >
                    {/* Landmark Photo with Vignette */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-black/30 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={status === 'SOLD' ? 'sold' : 'available'}
                          className="text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-md"
                        >
                          {status === 'SOLD' ? `Sold to ${winningTeam || 'Team'}` : 'Available'}
                        </Badge>
                      </div>

                      {/* Japanese Kanji Crest Stamp in corner */}
                      <div className="absolute top-3 left-3 h-8 w-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/15 text-kiniro-400 font-serif font-black flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-white group-hover:text-kiniro-300 transition-colors">
                          {name}
                        </h3>
                        <p className="text-xs text-sumi-300 line-clamp-2 mt-1">
                          {item.description || item.tagline || 'Sacred historic landmark available for offline bidding.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div>
                          <div className="text-[10px] text-sumi-400 uppercase tracking-wider font-semibold">
                            Starting Price
                          </div>
                          <div className="font-serif font-black text-lg text-kiniro-400">
                            {formatCurrency(price, '₹')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-sumi-400 uppercase tracking-wider font-semibold">
                            Valuation
                          </div>
                          <div className="text-xs text-sumi-300 font-mono italic">
                            🔒 Confidential
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-torii-600/20 text-torii-400 border border-torii-500/30 flex items-center justify-center mx-auto shadow-glow-torii">
                <Landmark className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                No Japanese Places Currently Listed
              </h3>
              <p className="text-sm text-sumi-300 max-w-lg mx-auto leading-relaxed">
                The auction catalogue is cleared and ready for new items. Administrators can add Japanese places with starting hammer prices and confidential actual valuations in the Admin Console.
              </p>
              <div className="pt-2">
                <Link href="/admin/places">
                  <Button size="sm" className="bg-gradient-to-r from-torii-600 to-rose-600 hover:from-torii-500 hover:to-rose-500 text-white font-semibold shadow-glow-torii">
                    Manage Places in Admin Console
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 8. Architectural Features & Japanese Bidding Rules Bento Grid */}
        <div className="w-full max-w-6xl mt-24 text-left space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono text-torii-400 uppercase tracking-widest font-semibold">
              Tournament Engineering
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
              Rules of the Sakura Auction Floor
            </h2>
            <p className="text-sm text-sumi-300">
              Built for seamless physical bidding with strict cryptographic transparency and anti-overbid damage controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border border-white/15 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md hover:border-torii-500/50 transition-all shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-torii-500/20 text-torii-400 border border-torii-500/30 flex items-center justify-center font-bold text-xl">
                  陣
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Dynamic Team Formation</h3>
                <p className="text-sm text-sumi-300 leading-relaxed">
                  Teams register dynamically with unique student enrollment validation. The system immediately generates isolated team portal credentials with temporary passwords.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-white/15 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md hover:border-kiniro-500/50 transition-all shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-kiniro-500/20 text-kiniro-400 border border-kiniro-500/30 flex items-center justify-center font-bold text-xl">
                  秘
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Confidential Benchmarks</h3>
                <p className="text-sm text-sumi-300 leading-relaxed">
                  Each landmark carries a secret actual worth hidden from the audience. The system evaluates true savings, return on capital, and value efficiency without leaking data.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-white/15 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md hover:border-emerald-500/50 transition-all shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
                  過
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Special Overpay Engine</h3>
                <p className="text-sm text-sumi-300 leading-relaxed">
                  If every team bids above actual worth, the system refuses to falsely declare a profitable winner. Instead, it recognizes damage-control champions who minimize net losses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 9. Final Call to Action */}
        <div className="w-full max-w-4xl mt-24 rounded-3xl border border-torii-500/40 bg-gradient-to-r from-torii-950/60 via-sumi-900/90 to-kiniro-950/60 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-torii-500/20 blur-3xl pointer-events-none" />
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-torii-600 to-kiniro-500 text-white flex items-center justify-center font-serif font-black text-2xl shadow-glow-torii">
            競
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Begin the Auction?
          </h2>
          <p className="text-sm sm:text-base text-sumi-200 max-w-xl mx-auto">
            Register your team members or open the 16:9 theater projection screen to begin physical bidding in the auction room.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-torii-600 hover:bg-torii-700 text-white font-bold px-8 h-12 rounded-xl shadow-glow-torii">
                Register Team
              </Button>
            </Link>
            <Link href="/presentation" target="_blank">
              <Button size="lg" variant="gold" className="px-8 h-12 rounded-xl shadow-glow-gold font-bold">
                Projector Screen
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 10. Footer */}
      <footer className="relative z-20 border-t border-white/10 py-8 px-6 text-center text-xs text-sumi-400 bg-[#07070a]/90 backdrop-blur-xl mt-16">
        <p className="text-sumi-300 font-serif">
          © 2026 Japanese Places Offline Auction System • 日本名所競売管理システム
        </p>
        <p className="mt-1.5 text-sumi-400">
          Strict offline live room auction protocol. Zero client-side bidding buttons.
        </p>
      </footer>
    </div>
  );
}
