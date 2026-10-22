---
name: design-md
description: >-
  Apply, inspect, and search 84 real-world DESIGN.md design system specifications (Google Stitch format)
  from leading developer and tech products (e.g. Linear, Vercel, Stripe, Raycast, Claude, Supabase,
  Apple, Cursor, Warp, PostHog, Airbnb, Figma). Use whenever the user asks for a specific company's
  design style, wants to "apply DESIGN.md", "use Linear's theme", "style like Vercel/Stripe", or
  wants a complete design system markdown file.
---

# DESIGN.md - Design Systems Collection

A curated collection of **84 production-grade `DESIGN.md` specifications** extracted from developer-focused tools and iconic consumer products, based on the Google Stitch specification standard.

Each file contains exact design tokens, typography scales, color ladders, surface hierarchies, border radiuses, spacing, motion curves, and component blueprints.

---

## How to Apply to a Project

### 1. Copy directly as the active project DESIGN.md
When requested to style a project like a specific brand (e.g., Linear, Vercel, Stripe):
1. Locate the brand in `./designs/<brand-id>/DESIGN.md`.
2. Copy it to the workspace root as `DESIGN.md`.
3. Read the design tokens (colors, typography, components, cards, buttons).
4. Implement the design using CSS variables or Tailwind CSS matching the specification.

---

## Available Design Systems (84 Brands)

### 🤖 AI & LLM Platforms
- `claude`: Anthropic's warm terracotta accent, clean editorial layout, serif/sans pairing
- `cohere`: Enterprise AI platform, vibrant gradients, data-rich dashboard aesthetic
- `elevenlabs`: AI voice platform, dark cinematic UI, waveform aesthetics
- `jobright`: AI job platform, spring-mint green, black pill buttons, condensed headlines
- `minimax`: AI model provider, bold dark interface with high-contrast neon accents
- `mistral.ai`: Open-weight LLM provider, French-engineered minimalism, purple-toned
- `ollama`: Run LLMs locally, terminal-first, monochrome stark simplicity
- `opencode.ai`: Developer-centric dark theme, code-forward layout
- `replicate`: Run ML models via API, clean white canvas, terminal aesthetics
- `runwayml`: AI creative tools, cinematic dark heroes, paper-white reading bands
- `together.ai`: Open-source AI infrastructure, technical blueprint-style design
- `voltagent`: AI agent framework, void-black canvas, emerald accent, terminal-native
- `x.ai`: Stark monochrome, futuristic minimalism, high-contrast dark mode

### 💻 Developer Tools & IDEs
- `cursor`: AI-first code editor, sleek dark chrome, subtle gradient borders
- `expo`: React Native platform, dark theme, tight letter-spacing, code-centric
- `linear.app`: Deepest dark canvas (#010102), lavender-blue (#5e6ad2) accent, precision craft
- `lovable`: AI full-stack builder, playful gradients, friendly dev aesthetic
- `raycast`: Productivity launcher, sleek dark glass, vibrant gradient accents
- `superhuman`: High-speed email, premium dark UI, keyboard-first, purple glow
- `vercel`: Pure black-and-white precision (#000, #fff), Geist font, crisp 1px borders
- `warp`: Modern terminal, dark IDE-like interface, block-based command UI
- `mintlify`: Documentation platform, clean developer aesthetics
- `figma`: Collaborative design tool, light and clean canvas, colorful presence
- `framer`: Visual web builder, high-craft dark mode, subtle motion
- `webflow`: Visual development platform, blue accent, structured workspace

### ⚡ Infrastructure, Data & DevOps
- `clickhouse`: Fast analytics database, yellow-accented, technical documentation style
- `composio`: Tool integration platform, modern dark with integration icons
- `hashicorp`: Infrastructure automation, enterprise-clean, stark structure
- `mongodb`: Document database, green leaf branding, developer focus
- `oracle`: Enterprise cloud, warm neutral ladder, charcoal-only actions
- `posthog`: Product analytics, playful hedgehog branding, retro developer dark UI
- `sanity`: Headless content platform, structured dark mode
- `sap`: Enterprise software, clean corporate blue hierarchy
- `sentry`: Developer error monitoring, purple and red accents, dense telemetry
- `supabase`: Open-source Firebase alternative, emerald green (#3ecf8e) on dark canvas
- `zapier`: Automation platform, bright orange signature accent

### 💳 Fintech & Crypto
- `binance`: High-density crypto exchange, gold/yellow on deep navy/black
- `coinbase`: Trust-first blue, clean consumer crypto hierarchy
- `kraken`: Vibrant purple, professional trading aesthetic
- `mercury`: Modern tech banking, sophisticated dark luxury, subtle serif touches
- `revolut`: Modern fintech, bold typography, sleek dark mode cards
- `stripe`: Industry-standard payment UI, vibrant gradient meshes, clean slate typography
- `wise`: Bold neo-grotesk typography, electric lime-green accent, accessible high contrast

### 📱 Consumer & Big Tech
- `apple`: Clean minimalism, San Francisco font, neutral gray surfaces, restrained accent
- `airbnb`: Warm coral (#ff385c), friendly rounded cards, high photography emphasis
- `airtable`: Multi-color database badges, clean modern grid
- `meta`: Modern clean social interface, blue accents
- `notion`: Monochromatic paper feel, serif/sans toggle, minimal borders
- `nike`: Bold, high-energy typography, dramatic photography, high contrast
- `pinterest`: Masonry grid, warm red accent, rounded card containers
- `playstation`: Deep blue and black gaming canvas, high-contrast action states
- `slack`: Aubergine accents, cheerful team communication UI
- `spotify`: Pure black canvas (#121212), signature green (#1db954), circular elements
- `starbucks`: Deep forest green (#006241), warm beige paper backgrounds
- `tesla`: High-tech minimalism, stark white/black, clean sans-serif typography
- `uber`: Monochromatic bold black-and-white, high readability, high utility

### 🏎️ Automotive & Luxury
- `bmw`: Elegant automotive luxury, light and dark modes
- `bmw-m`: High-performance motorsport aesthetic, carbon-fiber dark, tri-color M stripes
- `bugatti`: Ultra-luxury hypercar aesthetic, dark elegance, precision craftsmanship
- `ferrari`: Racing red (#ff2800), high drama, bold typography
- `lamborghini`: Aggressive angles, hexagonal geometric styling, black and gold/yellow
- `renault`: Modern geometric French design

### 📰 Media & Culture
- `aljazeera`: High-readability journalism, warm gold/amber accents, content-first
- `theverge`: Hyper-bold retro-futurism, sharp neon green and purple on dark
- `wired`: Editorial magazine layout, stark black typography, high-impact headlines
- `cal`: Scheduling platform, minimalist calendar styling
- `clay`: Relationship manager, sophisticated warm stone and charcoal
- `dji`: Drone & camera tech, clean slate-gray and industrial design
- `hp`: Enterprise technology, clean neutral palette
- `ibm`: Carbon design system principles, blue core, strict grid alignment
- `intercom`: Conversational messenger UI, warm and friendly customer engagement
- `nerdwallet`: Personal finance, clear data cards, green trust accents
- `oura`: Wellness ring app, dark sleep-tracking aesthetic, calming gradients
- `resend`: Email API, clean developer monochrome, high precision

---

## Step-by-Step Usage Guide

When the user asks to adopt or reference any of these design languages:
1. **Locate the file**: Read `.agents/skills/design-md/designs/<brand>/DESIGN.md`.
2. **Extract Key Tokens**:
   - Primary and background colors
   - Surface elevation levels (canvas, surface-1, surface-2, etc.)
   - Border radius rules (pills, sharp, or subtle 4px–8px)
   - Font family and weight combinations
3. **Apply to Code**:
   - Write CSS custom properties (`:root { ... }`) or Tailwind classes matching the spec.
   - Match the density, spacing, and micro-interactions outlined in the `DESIGN.md`.
