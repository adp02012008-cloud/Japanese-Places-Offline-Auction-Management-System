'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IPlace } from '@/types';

interface MovingPlacesBackgroundProps {
  places?: IPlace[];
}

export default function MovingPlacesBackground({ places = [] }: MovingPlacesBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const validImages = places
    .map((p) => p.imageUrl)
    .filter((url): url is string => Boolean(url && url.trim().length > 0));

  // Auto-advance if we have multiple valid real images
  useEffect(() => {
    if (validImages.length <= 1) return;

    const cycle = () => {
      setIsTransitioning(true);
      const incoming = (currentIndex + 1) % validImages.length;
      setNextIndex(incoming);

      setTimeout(() => {
        setCurrentIndex(incoming);
        setIsTransitioning(false);
      }, 1800);
    };

    intervalRef.current = setInterval(cycle, 7000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, validImages.length]);

  // Subtle interactive mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentImage = validImages[currentIndex] || '';
  const nextImage = validImages[nextIndex] || '';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Underlying Base Image if real auction places exist */}
      {currentImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out animate-kenburns-1 opacity-40"
          style={{
            backgroundImage: `url('${currentImage}')`,
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          }}
        />
      )}

      {/* 2. Incoming Cross-fade Image if cycling places */}
      {nextImage && nextImage !== currentImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity ease-in-out animate-kenburns-2 ${
            isTransitioning ? 'opacity-40' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${nextImage}')`,
            transform: `translate3d(${parallax.x * -0.7}px, ${parallax.y * -0.7}px, 0)`,
            transitionDuration: '1800ms',
          }}
        />
      )}

      {/* 3. Japanese Golden Sun & Torii Crimson Ambient Atmospheric Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full bg-gradient-to-b from-torii-600/30 via-rose-600/15 to-transparent blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-torii-500/35 to-kiniro-500/25 blur-[85px] pointer-events-none" />

      {/* 4. Elegant Cinematic Edge Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/90 via-[#07070a]/60 to-[#07070a]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-transparent to-[#07070a]/80 pointer-events-none" />

      {/* 5. Japanese Geometric Pattern Texture Overlay */}
      <div className="absolute inset-0 bg-japanese-pattern opacity-20 pointer-events-none" />
    </div>
  );
}
