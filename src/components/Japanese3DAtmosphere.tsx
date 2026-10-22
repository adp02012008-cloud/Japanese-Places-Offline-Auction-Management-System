'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Petal3D {
  x: number;
  y: number;
  z: number; // depth: 0.2 (far) to 1.8 (near/large)
  speedX: number;
  speedY: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  speedRotX: number;
  speedRotY: number;
  speedRotZ: number;
  size: number;
  opacity: number;
  colorType: number;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface Lantern {
  x: number;
  y: number;
  baseY: number;
  size: number;
  swing: number;
  swingSpeed: number;
  glowIntensity: number;
  glowSpeed: number;
  kanji: string;
}

export default function Japanese3DAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      mousePos.current.targetX = (e.clientX / width - 0.5) * 2;
      mousePos.current.targetY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Initialize 3D Sakura Petals
    const petalCount = Math.min(45, Math.floor(width / 30));
    const petals: Petal3D[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 1.4, // depth scaling
        speedX: 0.6 + Math.random() * 1.5,
        speedY: 0.9 + Math.random() * 2.0,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        speedRotX: (Math.random() - 0.5) * 0.04,
        speedRotY: (Math.random() - 0.5) * 0.05,
        speedRotZ: (Math.random() - 0.5) * 0.03,
        size: 10 + Math.random() * 14,
        opacity: 0.4 + Math.random() * 0.55,
        colorType: Math.random() > 0.3 ? 0 : 1, // 0 = cherry pink, 1 = golden petal
      });
    }

    // 2. Initialize Golden Embers / Fireflies
    const emberCount = 35;
    const embers: Ember[] = [];
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 3,
        speedY: -(0.4 + Math.random() * 1.2), // float upwards
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: 0.3 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05,
      });
    }

    // 3. Initialize Floating Traditional Japanese Lanterns
    const kanjiList = ['桜', '競', '美', '誉', '金', '光'];
    const lanternCount = Math.max(3, Math.min(6, Math.floor(width / 260)));
    const lanterns: Lantern[] = [];
    for (let i = 0; i < lanternCount; i++) {
      const spreadX = (width / (lanternCount + 1)) * (i + 1) + (Math.random() - 0.5) * 60;
      const baseY = height * 0.18 + Math.random() * (height * 0.45);
      lanterns.push({
        x: spreadX,
        y: baseY,
        baseY,
        size: 26 + Math.random() * 16,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.015 + Math.random() * 0.01,
        glowIntensity: 0.6 + Math.random() * 0.4,
        glowSpeed: 0.04 + Math.random() * 0.03,
        kanji: kanjiList[i % kanjiList.length],
      });
    }

    // Main 3D Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation for 3D parallax
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;
      const parallaxX = mousePos.current.x * 25;
      const parallaxY = mousePos.current.y * 20;

      // Draw Floating Lanterns (Midground)
      for (const l of lanterns) {
        l.swing += l.swingSpeed;
        l.glowIntensity = 0.65 + Math.sin(l.glowIntensity + l.glowSpeed) * 0.35;
        const currentY = l.baseY + Math.sin(l.swing) * 12 + parallaxY * 0.4;
        const currentX = l.x + Math.cos(l.swing * 0.7) * 8 + parallaxX * 0.4;

        ctx.save();
        ctx.translate(currentX, currentY);

        // Radiant Lantern Glow (Fire effect)
        const glowRad = l.size * 2.8;
        const glow = ctx.createRadialGradient(0, 0, l.size * 0.3, 0, 0, glowRad);
        glow.addColorStop(0, `rgba(255, 120, 40, ${0.45 * l.glowIntensity})`);
        glow.addColorStop(0.5, `rgba(244, 63, 94, ${0.25 * l.glowIntensity})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Body (Cylinder / Rounded Pill)
        const lw = l.size * 0.9;
        const lh = l.size * 1.4;

        ctx.shadowColor = 'rgba(251, 146, 60, 0.9)';
        ctx.shadowBlur = 18;

        const bodyGrad = ctx.createLinearGradient(-lw / 2, 0, lw / 2, 0);
        bodyGrad.addColorStop(0, '#991b1b');
        bodyGrad.addColorStop(0.3, '#f97316');
        bodyGrad.addColorStop(0.5, '#fef08a');
        bodyGrad.addColorStop(0.7, '#f97316');
        bodyGrad.addColorStop(1, '#991b1b');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(-lw / 2, -lh / 2, lw, lh, 8);
        ctx.fill();

        // Black Wooden Caps (Top & Bottom)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#171717';
        ctx.fillRect(-lw * 0.4, -lh / 2 - 4, lw * 0.8, 5);
        ctx.fillRect(-lw * 0.4, lh / 2 - 1, lw * 0.8, 5);

        // Gold Tassel string
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, lh / 2 + 4);
        ctx.lineTo(0, lh / 2 + 16);
        ctx.stroke();

        // Kanji Character
        ctx.fillStyle = '#450a0a';
        ctx.font = `bold ${Math.floor(l.size * 0.65)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(l.kanji, 0, 1);

        ctx.restore();
      }

      // Draw Rising Golden Embers (Foreground & Depth)
      for (const emb of embers) {
        emb.pulse += emb.pulseSpeed;
        emb.y += emb.speedY;
        emb.x += emb.speedX + Math.sin(emb.pulse) * 0.4 + parallaxX * 0.15;

        if (emb.y < -10) {
          emb.y = height + 10;
          emb.x = Math.random() * width;
        }

        const currentOpacity = emb.opacity * (0.6 + Math.sin(emb.pulse) * 0.4);

        ctx.save();
        ctx.beginPath();
        ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // Draw 3D Sakura Petals with Parallax and Z-Depth
      for (const p of petals) {
        p.rotationX += p.speedRotX;
        p.rotationY += p.speedRotY;
        p.rotationZ += p.speedRotZ;

        p.x += p.speedX * p.z;
        p.y += p.speedY * p.z;

        // Wrap borders
        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) {
          p.x = -30;
        } else if (p.x < -40) {
          p.x = width + 30;
        }

        // Apply 3D perspective projection
        const renderX = p.x + parallaxX * p.z * 1.8;
        const renderY = p.y + parallaxY * p.z * 1.8;
        const scaledSize = p.size * p.z;

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(p.rotationZ);
        ctx.scale(Math.cos(p.rotationY), Math.sin(p.rotationX));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(scaledSize / 2, -scaledSize / 2, scaledSize, -scaledSize / 4, scaledSize, scaledSize / 3);
        ctx.bezierCurveTo(scaledSize, scaledSize, 0, scaledSize * 1.25, 0, 0);

        const effOpacity = Math.min(1, p.opacity * (p.z > 1.2 ? 0.95 : 0.75));

        if (p.colorType === 0) {
          // Vibrant Sakura Pink
          const grad = ctx.createRadialGradient(
            scaledSize / 3,
            scaledSize / 3,
            1,
            scaledSize / 2,
            scaledSize / 2,
            scaledSize
          );
          grad.addColorStop(0, `rgba(255, 240, 246, ${effOpacity})`);
          grad.addColorStop(0.5, `rgba(244, 63, 94, ${effOpacity})`);
          grad.addColorStop(1, `rgba(190, 18, 60, ${effOpacity * 0.8})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
        } else {
          // Shimmering Golden Foil Petal
          const grad = ctx.createRadialGradient(
            scaledSize / 3,
            scaledSize / 3,
            1,
            scaledSize / 2,
            scaledSize / 2,
            scaledSize
          );
          grad.addColorStop(0, `rgba(254, 240, 138, ${effOpacity})`);
          grad.addColorStop(0.6, `rgba(234, 179, 8, ${effOpacity * 0.9})`);
          grad.addColorStop(1, `rgba(180, 83, 9, ${effOpacity * 0.7})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
        }

        ctx.shadowBlur = p.z > 1.0 ? 12 : 5;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
