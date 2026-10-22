---
name: lenis
description: High-performance smooth scrolling and scroll-driven animation architecture using Lenis by Darkroom Engineering (darkroomengineering/lenis). Use whenever adding smooth scrolling, scroll-triggered animations, GSAP ScrollTrigger synchronization, horizontal scroll, anchor navigation, or parallax interactions to web applications.
---

# Lenis Smooth Scrolling & Animation Skill

Lenis (`lenis` / `darkroomengineering/lenis`) is an ultra-lightweight, 60fps+ momentum-based smooth scroll library designed for modern web applications. It normalizes scrolling across browsers and input devices (mouse wheel, trackpad, touch) without destroying native accessibility, keyboard navigation, or browser performance.

---

## 1. Quick Installation

```bash
npm install lenis
```

*Note: In modern releases (`v1.x+`), React bindings (`ReactLenis`, `useLenis`) are built directly into the core package via `lenis/react`.*

---

## 2. Essential CSS Setup

Lenis requires specific base styles so the document viewport coordinates properly with smooth virtual scrolling without double scrollbars.

Add to your global stylesheet (`globals.css` / `index.css`):

```css
/* Lenis Core CSS */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-smooth iframe {
  pointer-events: none;
}
```

---

## 3. Next.js App Router Integration (Recommended)

In Next.js App Router, smooth scrolling should be encapsulated in a dedicated Client Component provider wrapped around the application children.

### A. Create the Smooth Scroll Provider
`src/components/providers/SmoothScrollProvider.tsx`:

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    // 2. RequestAnimationFrame loop
    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // 3. Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

### B. Alternatively: Using `ReactLenis` from `lenis/react`
```tsx
'use client';

import { ReactLenis } from 'lenis/react';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

### C. Wrap in Root Layout (`src/app/layout.tsx`)
```tsx
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
```

---

## 4. Hook API & Programmatic Navigation

### A. Accessing the Instance (`useLenis`)
```tsx
'use client';

import { useLenis } from 'lenis/react';

export function ScrollProgress() {
  useLenis(({ scroll, limit, velocity, direction, progress }) => {
    console.log(`Scroll: ${scroll}px (${(progress * 100).toFixed(1)}%)`);
  });

  return null;
}
```

### B. Smooth Anchor Navigation (`lenis.scrollTo`)
```tsx
const lenis = useLenis();

const handleScrollTo = (targetId: string) => {
  lenis?.scrollTo(`#${targetId}`, {
    offset: -80, // Compensate for fixed navbar
    duration: 1.5,
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });
};
```

---

## 5. Modal & Nested Scroll Handling (`data-lenis-prevent`)

When rendering scrollable nested containers (such as modals, drawers, datatables, or dropdown menus), prevent the root Lenis instance from capturing the scroll events by adding `data-lenis-prevent`:

```tsx
<div
  className="max-h-96 overflow-y-auto"
  data-lenis-prevent
>
  {/* Nested scroll content */}
</div>
```

To lock page scrolling during full-screen modal display:
```tsx
useEffect(() => {
  if (isModalOpen) {
    lenis?.stop();
  } else {
    lenis?.start();
  }
}, [isModalOpen, lenis]);
```

---

## 6. GSAP ScrollTrigger Synchronization

When pairing Lenis with GSAP ScrollTrigger for parallax or pinned section animations:

```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

// Synchronize Lenis scroll with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Direct GSAP ticker to drive Lenis RAF
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable GSAP lag smoothing to maintain fluid synchronization
gsap.ticker.lagSmoothing(0);
```

---

## 7. Performance Checklist & Best Practices

1. **Avoid `overflow: hidden` on `<body>`**: Keep `height: auto` on `html` and `body`.
2. **Prevent Double Scrollbars**: Do not place `overflow-y: scroll` on the parent container if Lenis is attached to `root`.
3. **Respect Reduced Motion**:
   ```typescript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (prefersReducedMotion) {
     lenis.destroy();
   }
   ```
4. **Use Hardware Acceleration**: Add `will-change: transform` or `transform: translateZ(0)` on animated elements driven by scroll position.
