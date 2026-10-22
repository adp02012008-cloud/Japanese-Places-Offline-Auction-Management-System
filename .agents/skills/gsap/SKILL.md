---
name: gsap
description: Official GSAP animation suite by GreenSock. Comprehensive guide covering core tweens, timelines, ScrollTrigger, React integration (useGSAP), Flip, MorphSVG, SplitText, performance optimization, and Lenis synchronization. Use whenever building or refining high-performance JavaScript animations.
---

# GSAP (GreenSock Animation Platform) Master Suite

Official animation suite by GreenSock. GSAP is 100% free for all uses, including commercial projects and previously Club-exclusive plugins (Flip, MorphSVG, SplitText, ScrollSmoother, Inertia).

---

## 1. Skill Modules Overview

The official GSAP skill set is organized into 8 specialized modules:

| Skill Module | Focus Area | Key APIs & Concepts |
| :--- | :--- | :--- |
| **`gsap-core`** | Fundamental tweens & eases | `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, `duration`, `stagger`, `ease`, `gsap.matchMedia()` |
| **`gsap-timeline`** | Step-by-step sequencing | `gsap.timeline()`, position parameter (`"<"`, `"+=0.2"`), labels, nesting, playback |
| **`gsap-scrolltrigger`** | Scroll-driven animation | `ScrollTrigger.create()`, `scrub`, `pin`, `start`/`end`, trigger callbacks, refresh & cleanup |
| **`gsap-react`** | React & Next.js integration | `@gsap/react`, `useGSAP()` hook, scoping refs, automatic cleanup, SSR hydration |
| **`gsap-plugins`** | Advanced plugins | `Flip`, `SplitText`, `MorphSVG`, `ScrollToPlugin`, `Draggable`, `InertiaPlugin`, `Observer` |
| **`gsap-utils`** | Mathematical & array utilities | `gsap.utils.clamp()`, `mapRange()`, `interpolate()`, `random()`, `snap()`, `toArray()`, `pipe()` |
| **`gsap-performance`** | 60fps+ rendering optimization | `x`/`y`/`scale` vs layout props, `willChange`, `fastScrollEnd`, batching, lag smoothing |
| **`gsap-frameworks`** | Multi-framework support | Vue (`onMounted`/`onUnmounted`), Svelte (`onMount`), vanilla DOM scoping |

---

## 2. Quick Installation

```bash
# Core GSAP and official React hook
npm install gsap @gsap/react
```

---

## 3. Canonical Architecture & React Pattern

### A. Register Plugins Once
```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}
```

### B. Idiomatic React Component (`useGSAP`)
Always use `useGSAP()` with a component container ref to guarantee automatic context scoping and cleanup:

```tsx
'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Timeline with position parameter and stagger
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    tl.from('.hero-badge', { y: -20, opacity: 0 })
      .from('.hero-title', { y: 30, opacity: 0 }, '-=0.4')
      .from('.hero-card', { scale: 0.9, opacity: 0, stagger: 0.15 }, '-=0.3');
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hero-container">
      <span className="hero-badge">Special Feature</span>
      <h1 className="hero-title">Experience Japanese Heritage</h1>
      <div className="hero-card">Card 1</div>
      <div className="hero-card">Card 2</div>
    </div>
  );
}
```

---

## 4. ScrollTrigger with Lenis Synchronization

When synchronizing GSAP ScrollTrigger with the Lenis smooth scrolling engine:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

// 1. Update ScrollTrigger on every Lenis scroll tick
lenis.on('scroll', ScrollTrigger.update);

// 2. Drive Lenis through GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// 3. Disable lag smoothing to prevent stutter during high framerates
gsap.ticker.lagSmoothing(0);
```

---

## 5. Performance Golden Rules
1. **Never animate layout properties** (`top`, `left`, `width`, `height`, `margin`). Animate transform equivalents: `x`, `y`, `scale`, `rotation`, and `autoAlpha`.
2. **Use `autoAlpha` instead of `opacity`**: Sets `visibility: hidden` when opacity reaches 0, removing the element from paint and hit-testing overhead.
3. **Always scope and clean up**: In React/Next.js, never leave dangling tweens or untracked triggers on route changes.
