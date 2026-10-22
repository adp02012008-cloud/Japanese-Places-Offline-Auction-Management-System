'use client';

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  flipSpeed: number;
  flip: number;
}

export default function SakuraPetalsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petalCount = Math.min(38, Math.floor(width / 35));
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 9 + Math.random() * 10,
        speedX: -1 + Math.random() * 2 + 0.8, // gentle rightward drift
        speedY: 0.8 + Math.random() * 1.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.4 + Math.random() * 0.45,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.015 + Math.random() * 0.02,
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(1, Math.sin(p.flip));

      // Delicate sakura petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 3);
      ctx.bezierCurveTo(p.size, p.size, 0, p.size * 1.2, 0, 0);

      // Japanese cherry blossom gradient
      const gradient = ctx.createRadialGradient(
        p.size / 3,
        p.size / 3,
        1,
        p.size / 2,
        p.size / 2,
        p.size
      );
      gradient.addColorStop(0, `rgba(255, 235, 242, ${p.opacity})`);
      gradient.addColorStop(0.6, `rgba(244, 114, 182, ${p.opacity * 0.85})`);
      gradient.addColorStop(1, `rgba(225, 29, 72, ${p.opacity * 0.6})`);

      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(244, 114, 182, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of petals) {
        drawPetal(p);

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Wrap around borders
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80"
      aria-hidden="true"
    />
  );
}
