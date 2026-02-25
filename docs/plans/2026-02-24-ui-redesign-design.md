# SpeakDaily UI Redesign — Design Document

## Goal

Replace the current navy/gold Toastmasters theme with a deep charcoal + electric blue dark UI. Strip the homepage down to a single job: get the user to record. Apply the new palette consistently across all screens.

## Design Decisions

### Color System

| Token | Old value | New value | Usage |
|---|---|---|---|
| `--background` | `#FAF8F4` | `#111827` | App background |
| `--card` | `#FFFFFF` | `#1F2937` | Cards, panels |
| `--foreground` | `#1B2A4A` | `#F9FAFB` | Primary text |
| `--muted-foreground` | `#6B6552` | `#9CA3AF` | Secondary text |
| `--primary` | `#1B2A4A` | `#3B82F6` | CTA buttons, accent |
| `--accent` | `#C9A84C` | `#3B82F6` | Accent labels |
| `--muted` | `#EEE9DF` | `#374151` | Progress tracks, chips bg |
| `--border` | `rgba(27,42,74,0.12)` | `rgba(255,255,255,0.1)` | Card borders |

### Homepage

Stripped to bare minimum — one job: get them to record.

```
┌─────────────────────────────────────┐
│  SpeakDaily                    [≡]  │  ← header (history icon right)
│                                     │
│  ┌─────────────────────────────┐   │
│  │  "Your Practice Topic"      │   │  ← label
│  │                             │   │
│  │  If you could have dinner   │   │  ← topic text
│  │  with any historical        │   │
│  │  figure, who would it be?   │   │
│  └─────────────────────────────┘   │
│                                     │
│          ↺  New topic               │  ← plain text link, no border/bg
│                                     │
│   ┌─────────────────────────────┐  │
│   │      Start Recording        │  │  ← large blue CTA
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Removed:**
- 4-icon benefit grid (Confidence / Daily / Progress / Excel)
- "Built for Toastmasters" info box
- Hero tagline block ("Become the best speaker in your club")
- Animated "GO" badge on CTA button

### History / My Reps

- Same layout (thumbnail + modal player already implemented)
- Apply dark palette to all cards, header, background, text
- Score badge: `bg-[#3B82F6]` text-white (was navy)
- Analyze / View Analysis buttons: blue accent

### Recording Screen

- Dark background instead of gradient from FAF8F4
- "Start Recording" button: blue (was navy)
- Error screen: dark background

### Dashboard Screen

- Dark background, dark cards
- ScoreBar track: `#374151` (was `#EEE9DF`)
- Section labels: `text-[#3B82F6]` (was gold)
- Summary card: `bg-[#1F2937]` with blue label (was navy)
- Filler word chips: dark bg, light text

## Architecture

All changes are CSS/JSX only — no logic, no routes, no DB changes.

**Files to modify:**
1. `src/styles/theme.css` — update `:root` CSS variables
2. `src/app/screens/Home.tsx` — strip layout + recolor
3. `src/app/screens/History.tsx` — recolor only
4. `src/app/screens/Recording.tsx` — recolor only
5. `src/app/screens/Dashboard.tsx` — recolor only
