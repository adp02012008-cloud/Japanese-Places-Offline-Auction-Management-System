'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Sparkles, Compass } from 'lucide-react';

export interface JapaneseLandmark {
  name: string;
  kanji: string;
  romaji: string;
  region: string;
  tagline: string;
  imageUrl: string;
}

export const MOVING_LANDMARKS: JapaneseLandmark[] = [
  {
    name: 'Mount Fuji',
    kanji: '富士山',
    romaji: 'Fuji-san',
    region: 'Honshu',
    tagline: 'Sacred UNESCO Summit at 3,776m',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Fushimi Inari Taisha',
    kanji: '伏見稲荷大社',
    romaji: 'Kyoto',
    region: 'Kyoto',
    tagline: '10,000 Vermilion Torii Gates Path',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Kinkaku-ji Golden Pavilion',
    kanji: '金閣寺',
    romaji: 'Rokuon-ji',
    region: 'Kyoto',
    tagline: 'Pure Gold Leaf Zen Buddhist Temple',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Himeji Castle',
    kanji: '姫路城',
    romaji: 'Shirasagi-jō',
    region: 'Hyogo',
    tagline: 'The Legendary White Heron Fortress',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Itsukushima Floating Torii',
    kanji: '厳島神社',
    romaji: 'Miyajima',
    region: 'Hiroshima',
    tagline: 'Ethereal Shrine Drifting Over the Sea',
    imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Shirakawa-go Historic Village',
    kanji: '白川郷',
    romaji: 'Gifu',
    region: 'Gifu Alps',
    tagline: 'Steep Thatched-Roof Gassho-zukuri Hamlet',
    imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Matsumoto Crow Castle',
    kanji: '松本城',
    romaji: 'Karasu-jō',
    region: 'Nagano',
    tagline: 'Six-Story Historic Black Timber Keep',
    imageUrl: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Todai-ji Great Buddha Hall',
    kanji: '東大寺',
    romaji: 'Nara',
    region: 'Nara',
    tagline: 'Colossal Bronze Buddha in Ancient Temple',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1920&auto=format&fit=crop',
  },
];

interface MovingPlacesBackgroundProps {
  onLandmarkChange?: (landmark: JapaneseLandmark) => void;
}

export default function MovingPlacesBackground({ onLandmarkChange }: MovingPlacesBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance the moving place every 6.5s
  useEffect(() => {
    const cycle = () => {
      setIsTransitioning(true);
      const incoming = (currentIndex + 1) % MOVING_LANDMARKS.length;
      setNextIndex(incoming);

      setTimeout(() => {
        setCurrentIndex(incoming);
        setIsTransitioning(false);
        if (onLandmarkChange) {
          onLandmarkChange(MOVING_LANDMARKS[incoming]);
        }
      }, 1800); // Cross-fade duration
    };

    intervalRef.current = setInterval(cycle, 6500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, onLandmarkChange]);

  // Subtle interactive mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX / innerWidth) - 0.5) * 16; // -8px to +8px
      const y = ((e.clientY / innerHeight) - 0.5) * 16;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const goTo = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setNextIndex(index);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      if (onLandmarkChange) {
        onLandmarkChange(MOVING_LANDMARKS[index]);
      }
    }, 1200);
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + MOVING_LANDMARKS.length) % MOVING_LANDMARKS.length;
    goTo(prev);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % MOVING_LANDMARKS.length;
    goTo(next);
  };

  const currentPlace = MOVING_LANDMARKS[currentIndex];
  const nextPlace = MOVING_LANDMARKS[nextIndex];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Underlying Base Moving Place Image with Ken Burns Drift */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out animate-kenburns-1"
        style={{
          backgroundImage: `url('${currentPlace.imageUrl}')`,
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      />

      {/* 2. Incoming Moving Place Image for Seamless Cross-fade */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity ease-in-out animate-kenburns-2 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url('${nextPlace.imageUrl}')`,
          transform: `translate3d(${parallax.x * -0.7}px, ${parallax.y * -0.7}px, 0)`,
          transitionDuration: '1800ms',
        }}
      />

      {/* 3. Japanese Golden Sun & Torii Crimson Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full bg-gradient-to-b from-torii-600/35 via-rose-600/20 to-transparent blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-torii-500/40 to-kiniro-500/30 blur-[85px] pointer-events-none" />

      {/* 4. Elegant Cinematic Edge Vignettes for Pristine Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/85 via-[#07070a]/45 to-[#07070a]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/75 via-transparent to-[#07070a]/75 pointer-events-none" />

      {/* 5. Japanese Geometric Pattern Texture Overlay */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-25 pointer-events-none" />

      {/* 6. Interactive Floating Place HUD (Bottom Left Badge) */}
      <div className="pointer-events-auto absolute bottom-8 left-6 lg:left-12 z-20 hidden md:flex items-center space-x-3 bg-black/60 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-2xl shadow-2xl transition-all duration-500 hover:border-kiniro-500/50 hover:bg-black/75 group">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-torii-600 to-rose-700 text-white flex items-center justify-center font-serif font-black text-sm shadow-glow-torii border border-torii-400/40">
          {currentPlace.kanji.charAt(0)}
        </div>

        <div className="text-left pr-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white text-xs tracking-wider flex items-center gap-1.5">
              <span>{currentPlace.kanji}</span>
              <span className="text-sumi-400">•</span>
              <span className="text-kiniro-400">{currentPlace.name}</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-sumi-300 font-mono">
              {currentPlace.region}
            </span>
          </div>
          <p className="text-[11px] text-sumi-300 font-sans tracking-wide">
            {currentPlace.tagline}
          </p>
        </div>

        {/* Prev / Next Place Quick Switch Controls */}
        <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
          <button
            onClick={handlePrev}
            title="Previous landmark place"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/20 text-sumi-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={handleNext}
            title="Next landmark place"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/20 text-sumi-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex items-center space-x-1 pl-1">
          {MOVING_LANDMARKS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              title={`Switch to ${MOVING_LANDMARKS[i].name}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? 'w-4 bg-kiniro-400 shadow-glow-gold'
                  : 'w-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
