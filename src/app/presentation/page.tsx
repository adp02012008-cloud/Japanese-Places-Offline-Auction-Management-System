'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Coins,
  Sparkles,
  CheckCircle,
  Crown,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { IPlace, ITeam } from '@/types';

export default function PresentationPage() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [currency, setCurrency] = useState('₹');
  const [eventName, setEventName] = useState('Japanese Places Offline Auction 2026');
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  const fetchPresentationFeed = async () => {
    try {
      const res = await fetch('/api/presentation');
      const data = await res.json();
      if (data.success) {
        setPlaces(data.places || []);
        setTeams(data.teams || []);
        setCurrency(data.currency || '₹');
        setEventName(data.eventName || 'Japanese Places Offline Auction');
        setAnnouncement(data.publicAnnouncement);
      }
    } catch (err) {
      console.error('Error updating presentation feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationFeed();
    // Live polling every 3 seconds for projector/big-screen real-time synchronization
    const interval = setInterval(fetchPresentationFeed, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlace = places[currentIndex];

  const handleNext = () => {
    if (places.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % places.length);
  };

  const handlePrev = () => {
    if (places.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + places.length) % places.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation for presentation remote or arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [places.length]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Subtle Japanese Crest Watermark & Ambient Gold Backlight */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-torii-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full bg-kiniro-500/10 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 px-8 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-torii-600 text-white flex items-center justify-center font-serif font-black text-xl shadow-glow-torii">
            競
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-xl tracking-wider text-white">
              {eventName}
            </h1>
            <div className="text-xs text-kiniro-400 font-sans tracking-widest uppercase flex items-center gap-2">
              <span>Physical Offline Bidding</span>
              <span>•</span>
              <span>Room Session Live</span>
            </div>
          </div>
        </div>

        {/* Presenter Controls */}
        <div className="flex items-center space-x-3">
          <Badge variant="gold" className="text-xs px-2.5 py-1 tracking-wider uppercase font-bold">
            Live Feed
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs h-8"
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5 mr-1" /> : <Maximize className="h-3.5 w-3.5 mr-1" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>

          <Link href="/admin/dashboard" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs h-8"
            >
              Admin Controls
            </Button>
          </Link>
        </div>
      </header>

      {/* Official Ceremony Announcement Banner on Big Screen */}
      {announcement?.isPublic && (
        <div
          className={`relative z-20 px-8 py-3.5 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-2xl transition-all animate-in slide-in-from-top-4 duration-500 ${
            announcement.noPositiveSavings
              ? 'bg-rose-950/85 border-rose-500/50 text-rose-200'
              : 'bg-kiniro-950/90 border-kiniro-500/60 text-kiniro-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-serif font-black text-base shadow-md ${
                announcement.noPositiveSavings
                  ? 'bg-rose-600 text-white shadow-rose-900/40'
                  : 'bg-kiniro-500 text-sumi-950 shadow-kiniro-900/40'
              }`}
            >
              {announcement.noPositiveSavings ? '過' : '勝'}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                Official Ceremony Announcement
              </div>
              <div className="font-serif font-black text-lg sm:text-xl text-white">
                {announcement.announcementMessage}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={announcement.noPositiveSavings ? 'destructive' : 'gold'}
              className="text-xs font-bold px-3 py-1 uppercase tracking-wide"
            >
              {announcement.announcementLabel}
            </Badge>
            <span className="font-serif font-extrabold text-white text-lg sm:text-xl">
              {announcement.noPositiveSavings
                ? announcement.bestPerformingTeamName
                : announcement.winningTeamName}
            </span>
          </div>
        </div>
      )}

      {/* Main 16:9 Stage Area */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10 items-center max-w-[1920px] mx-auto w-full">
        {/* Left Column: Landmark Photograph & Title (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {currentPlace ? (
            <div className="space-y-4">
              {/* Place Image with High-Definition Frame */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-black/80">
                <img
                  src={currentPlace.imageUrl}
                  alt={currentPlace.placeName}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Status Badge in top right */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    variant={
                      currentPlace.status === 'NOT_SOLD'
                        ? 'available'
                        : currentPlace.status === 'SOLD'
                        ? 'sold'
                        : 'withdrawn'
                    }
                    className="text-sm px-3.5 py-1 font-bold shadow-lg uppercase tracking-wider"
                  >
                    {currentPlace.status === 'NOT_SOLD'
                      ? 'Available for Bidding'
                      : currentPlace.status === 'SOLD'
                      ? 'Sold Out'
                      : 'Withdrawn'}
                  </Badge>
                </div>

                {/* Price Display on Bottom Left of Image */}
                <div className="absolute bottom-4 left-4 z-10 space-y-1">
                  <div className="text-xs text-sumi-300 tracking-wider uppercase font-semibold">
                    Starting Hammer Price
                  </div>
                  <div className="font-serif font-black text-3xl sm:text-4xl text-kiniro-400 drop-shadow-md">
                    {formatCurrency(currentPlace.startingPrice, currency)}
                  </div>
                </div>

                {/* Sold Overlay Notification if confirmed */}
                {currentPlace.status === 'SOLD' && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in duration-500">
                    <div className="h-16 w-16 rounded-full bg-torii-600/30 text-torii-400 border border-torii-500 flex items-center justify-center">
                      <Crown className="h-8 w-8" />
                    </div>
                    <div className="text-sm tracking-widest text-kiniro-400 uppercase font-bold">
                      Landmark Acquired!
                    </div>
                    <div className="font-serif font-extrabold text-3xl sm:text-5xl text-white">
                      {currentPlace.winningTeamName}
                    </div>
                    <div className="font-serif text-2xl text-emerald-400 font-bold">
                      Sold for {formatCurrency(currentPlace.finalPurchasePrice, currency)}
                    </div>
                  </div>
                )}
              </div>

              {/* Title, Description & Controls */}
              <div className="flex items-start justify-between gap-4 pt-2">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide leading-tight">
                    {currentPlace.placeName}
                  </h2>
                  <p className="text-sm sm:text-base text-sumi-300 mt-2 max-w-2xl leading-relaxed">
                    {currentPlace.description}
                  </p>
                </div>

                {/* Next / Prev Stepper */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handlePrev}
                    className="h-12 w-12 rounded-xl border-white/20 bg-white/5 hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleNext}
                    className="h-12 w-12 rounded-xl border-white/20 bg-white/5 hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-sumi-400">
              No Japanese places currently loaded. Please add places via the Admin Console.
            </div>
          )}
        </div>

        {/* Right Column: Live Participating Team Budgets Grid (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 h-full">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-kiniro-400" />
                <h3 className="font-serif font-bold text-lg text-white uppercase tracking-wider">
                  Live Team Budgets
                </h3>
              </div>
              <span className="text-xs text-sumi-400 font-mono">
                {teams.length} Teams Competing
              </span>
            </div>

            {/* Teams Grid (Readable from distance!) */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {teams.length === 0 ? (
                <div className="py-12 text-center text-sumi-400 text-sm">
                  Waiting for approved teams...
                </div>
              ) : (
                teams.map((t) => (
                  <div
                    key={t._id}
                    className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-kiniro-500/40 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-base sm:text-lg text-white tracking-wide">
                        {t.teamName}
                      </div>
                      <div className="text-xs text-sumi-400 font-sans">
                        Spent: {formatCurrency(t.totalSpent, currency)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-sumi-400 uppercase tracking-wider">
                        Remaining
                      </div>
                      <div className="font-serif font-extrabold text-xl sm:text-2xl text-emerald-400">
                        {formatCurrency(t.remainingBudget, currency)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Offline Rules Notice */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/30 text-xs text-sumi-400 flex items-center justify-between">
            <span>Physical bidding conducted in room by auctioneer.</span>
            <span className="text-kiniro-400 font-semibold font-mono">16:9 Theater View</span>
          </div>
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="relative z-20 px-8 py-3 border-t border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between text-xs text-sumi-400">
        <div>
          Place <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{places.length}</strong>
        </div>
        <div className="hidden sm:block">
          Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-mono">→</kbd> arrows to navigate landmarks
        </div>
        <div>
          Japanese Places Offline Auction © 2026
        </div>
      </footer>
    </div>
  );
}
