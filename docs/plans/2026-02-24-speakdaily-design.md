# SpeakDaily — AI Feedback Dashboard & Rebrand Design

**Date:** 2026-02-24
**App:** TabelTopicsApp (repo) → SpeakDaily (brand)
**Domain:** speakdaily.club

---

## Overview

Transform the existing Table Topics practice app into **SpeakDaily** — a Toastmasters-aligned coaching tool that gives users AI-powered feedback on their recorded practice sessions. The core addition is an on-demand analysis dashboard that transcribes videos, counts filler words, grades word choice, analyzes vocal variety and tonality, and delivers Toastmasters-standard coaching feedback.

---

## Goals

1. Add an AI Feedback Dashboard screen (`/dashboard/:id`) for each recording
2. Rebrand the app to SpeakDaily with a warm, professional navy + gold theme
3. Update all copy to an aspirational, competitive tone: "Become the best speaker in your club"

---

## Architecture

### Stack (additions to existing)

| Layer | Technology |
|-------|-----------|
| Backend | Supabase Edge Functions (Deno) |
| Transcription + Audio Analysis | AssemblyAI API |
| AI Feedback | Anthropic Claude API (`claude-sonnet-4-6`) |
| Database | Supabase (new `analyses` table) |

### Analysis Pipeline

```
User taps "Analyze" in History
        │
        ▼
POST /functions/v1/analyze-recording
  { recording_id }
  → Fetches video URL from Supabase
  → Submits video to AssemblyAI (returns transcript_id)
  → Saves { recording_id, assemblyai_id, status: "processing" } to analyses table
  → Returns { analysis_id, status: "processing" }
        │
        ▼  (frontend polls every 5 seconds)
GET /functions/v1/get-analysis?recording_id=...
  → Checks analyses table
  → If status = "processing": polls AssemblyAI for completion
  → If AssemblyAI complete:
      → Calls Claude API with transcript + audio metrics + original prompt
      → Claude returns structured JSON feedback
      → Saves full results to analyses table, status = "complete"
  → Returns { status, data?: Analysis }
        │
        ▼
Frontend navigates to /dashboard/:id
```

### AssemblyAI Data Used

- `text` — full transcript
- `words` — word-level timestamps (for filler detection)
- `filler_words` — native filler word detection (um, uh, like, you know, etc.)
- `sentiment_analysis_results` — sentence-level sentiment (proxy for tonality)
- `words_per_minute` — speech rate (proxy for vocal variety/pacing)
- `audio_duration` — total speech time

### Claude Prompt Structure

```
You are a Toastmasters speech evaluator. Given the following data from a Table Topics response, provide structured coaching feedback.

Topic/Prompt: {original_prompt}
Duration: {duration}s
Transcript: {transcript}
Words per minute: {wpm}
Filler words detected: {filler_words_summary}
Sentence-level sentiment: {sentiment_data}

Return a JSON object with:
{
  overall_score: number (1-10),
  overall_label: string ("Needs Work" | "Developing" | "Competent" | "Strong" | "Exceptional"),
  scores: {
    vocal_variety: number (1-10),
    tonality: number (1-10),
    word_choice: number (1-10),
    filler_words: number (1-10, inverse — fewer fillers = higher score)
  },
  filler_word_breakdown: { word: string, count: number }[],
  filler_word_total: number,
  transcription: string,
  feedback_points: string[] (3-5 actionable coaching tips),
  summary: string (2-3 sentence overall assessment)
}

Do not evaluate gestures or body language — audio and speech only.
Evaluate against Toastmasters Table Topics standards (1-2 minute responses).
```

### Supabase Schema Addition

```sql
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id text REFERENCES recordings(id) ON DELETE CASCADE,
  assemblyai_id text,
  status text DEFAULT 'processing', -- 'processing' | 'complete' | 'error'
  transcript text,
  overall_score numeric,
  overall_label text,
  scores jsonb,
  filler_word_breakdown jsonb,
  filler_word_total integer,
  feedback_points jsonb,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## New Screen: Dashboard (`/dashboard/:id`)

Navigated to from History after analysis completes. Shows:

```
┌─────────────────────────────────────┐
│  ← Back        SpeakDaily           │
├─────────────────────────────────────┤
│  [Video Player — full width]         │
│  Prompt: "If you could have..."     │
├─────────────────────────────────────┤
│  OVERALL SCORE                       │
│  ┌───────────────────────────────┐  │
│  │  8.2 / 10   ★ Strong          │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  BREAKDOWN (progress bars)          │
│  Vocal Variety    ██████░░   7/10   │
│  Tonality         ███████░   8/10   │
│  Word Choice      ████████   9/10   │
│  Filler Words     ████░░░░   5/10   │
├─────────────────────────────────────┤
│  FILLER WORDS  (12 total)           │
│  "um" × 8  "uh" × 3  "like" × 1   │
├─────────────────────────────────────┤
│  TRANSCRIPTION          [expand ▼] │
│  "If I could have dinner with..."  │
├─────────────────────────────────────┤
│  FEEDBACK & TIPS                    │
│  • Great opening hook...            │
│  • Watch pacing in the middle      │
│  • Strong vocab — avoid passive    │
└─────────────────────────────────────┘
```

---

## History Screen Changes

- Each recording card gains an **"Analyze"** button (if no analysis exists) or **"View Analysis"** button (if analysis exists)
- After tapping "Analyze": button shows loading spinner, polls for completion, then navigates to Dashboard
- Analysis result badge (score pill) shown on the card once complete

---

## Theme & Branding

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#1B2A4A` | Navy — buttons, headers |
| `--accent` | `#C9A84C` | Gold — highlights, badges, score rings |
| `--background` | `#FAF8F4` | Warm off-white |
| `--card` | `#FFFFFF` | Cards |
| `--muted` | `#EEE9DF` | Subtle backgrounds |

### Copy Changes

| Before | After |
|--------|-------|
| "Daily Table Topics" | "SpeakDaily" |
| "Master Table Topics Anytime, Anywhere" | "Become the best speaker in your club." |
| "Practice impromptu speaking daily..." | "Get Toastmasters-grade feedback on every practice rep." |
| "Start Recording" | "Start Your Rep" |
| "My Recordings" | "My Reps" |
| "Congrats on practicing today!" | "Great rep. Keep climbing." |
| "Why Toastmasters Love This" | "Built for Toastmasters" |

### Files to Update

- `src/styles/theme.css` — CSS variables
- `src/app/screens/Home.tsx` — hero copy, button text, branding
- `src/app/screens/Recording.tsx` — header title
- `src/app/screens/History.tsx` — header, toast message, card UI
- `src/app/App.tsx` — app title if present
- `index.html` — `<title>` tag

---

## New Files

| File | Purpose |
|------|---------|
| `src/app/screens/Dashboard.tsx` | AI feedback dashboard screen |
| `src/app/utils/analysis.ts` | API calls for analyze + poll |
| `supabase/functions/analyze-recording/index.ts` | Edge Function — kicks off AssemblyAI |
| `supabase/functions/get-analysis/index.ts` | Edge Function — polls AssemblyAI, calls Claude, returns results |

---

## Environment Variables Needed

```bash
# Frontend (.env)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Supabase Edge Functions (via supabase secrets)
ASSEMBLYAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

---

## Out of Scope

- Gesture / body language analysis (explicitly excluded)
- User authentication (stays device_id based)
- Batch re-analysis of all old recordings
- Mobile app wrapping
