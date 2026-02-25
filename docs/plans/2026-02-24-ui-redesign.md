# SpeakDaily UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the navy/gold theme with a deep charcoal + electric blue dark UI, and strip the homepage down to its single job: get the user to record.

**Architecture:** Pure CSS/JSX changes only — no logic, no routes, no DB changes. Five files touched in sequence: theme variables first, then each screen. All hardcoded `#1B2A4A`/`#C9A84C` values are replaced with new dark palette values.

**Tech Stack:** React, TypeScript, Tailwind v4, Vite

---

### Task 1: Update theme.css — dark palette CSS variables

**Files:**
- Modify: `src/styles/theme.css:1-42` (the `:root` block only)

**Step 1: Replace the entire `:root` block**

Open `src/styles/theme.css`. Replace lines 3–42 (the `:root { ... }` block) with:

```css
:root {
  --font-size: 16px;
  --background: #111827;
  --foreground: #F9FAFB;
  --card: #1F2937;
  --card-foreground: #F9FAFB;
  --popover: #1F2937;
  --popover-foreground: #F9FAFB;
  --primary: #3B82F6;
  --primary-foreground: #FFFFFF;
  --secondary: #1F2937;
  --secondary-foreground: #F9FAFB;
  --muted: #374151;
  --muted-foreground: #9CA3AF;
  --accent: #3B82F6;
  --accent-foreground: #FFFFFF;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.1);
  --input: transparent;
  --input-background: #374151;
  --switch-background: #374151;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #3B82F6;
  --chart-1: #3B82F6;
  --chart-2: #1F2937;
  --chart-3: #60A5FA;
  --chart-4: #93C5FD;
  --chart-5: #374151;
  --radius: 0.625rem;
  --sidebar: #1F2937;
  --sidebar-foreground: #F9FAFB;
  --sidebar-primary: #3B82F6;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #374151;
  --sidebar-accent-foreground: #F9FAFB;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-ring: #3B82F6;
}
```

Leave the `.dark { ... }` block and everything below it untouched.

**Step 2: Verify**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/styles/theme.css
git commit -m "style: dark charcoal + electric blue theme variables"
```

---

### Task 2: Redesign Home.tsx — strip to bare minimum

**Files:**
- Modify: `src/app/screens/Home.tsx` (full rewrite)

**Step 1: Replace the entire file**

Write the following to `src/app/screens/Home.tsx`:

```tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { History, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { getRandomPrompt } from "../utils/recordings";
import { analytics } from "../utils/analytics";

export function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(() => getRandomPrompt());

  useEffect(() => {
    analytics.pageView("Home");
  }, []);

  const handleNewPrompt = () => {
    const newPrompt = getRandomPrompt();
    setPrompt(newPrompt);
    analytics.generatePrompt(newPrompt);
  };

  const handleStartRecording = () => {
    navigate("/recording", { state: { prompt } });
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl text-[#F9FAFB]">SpeakDaily</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/history")}
          className="text-[#9CA3AF] hover:text-[#F9FAFB]"
        >
          <History className="size-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        {/* Prompt Card */}
        <div className="bg-[#1F2937] rounded-2xl p-6 mb-5 border border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#3B82F6] font-semibold mb-3">
            Your Practice Topic
          </p>
          <p className="text-lg leading-relaxed text-[#F9FAFB] min-h-[80px]">
            {prompt}
          </p>
        </div>

        {/* New Topic Link */}
        <button
          onClick={handleNewPrompt}
          className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] mb-8 self-center transition-colors"
        >
          <RefreshCw className="size-3.5" />
          New topic
        </button>

        {/* CTA Button */}
        <Button
          onClick={handleStartRecording}
          className="w-full h-14 text-lg font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
        >
          Start Recording
        </Button>
      </main>
    </div>
  );
}
```

**Step 2: Verify**

```bash
npm run build
```

Expected: Build succeeds. No TypeScript errors.

**Step 3: Visual check**

```bash
npm run dev
```

Navigate to `http://localhost:5173` (or the port shown). Confirm:
- Dark charcoal background (`#111827`)
- SpeakDaily header top-left, history icon top-right
- Dark card with blue "YOUR PRACTICE TOPIC" label and prompt text
- Small "↺ New topic" text link below card (no border/background)
- Large blue "Start Recording" button
- Nothing else on the page

**Step 4: Commit**

```bash
git add src/app/screens/Home.tsx
git commit -m "style: strip homepage to topic prompt + record CTA only"
```

---

### Task 3: Recolor History.tsx

**Files:**
- Modify: `src/app/screens/History.tsx`

**Step 1: Apply color changes**

Make these targeted replacements in `src/app/screens/History.tsx`:

| Old | New |
|-----|-----|
| `className="min-h-screen bg-gradient-to-b from-[#FAF8F4] to-white"` | `className="min-h-screen bg-[#111827]"` |
| `className="p-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#EEE9DF] z-10"` | `className="p-4 flex items-center gap-3 sticky top-0 bg-[#111827] border-b border-white/10 z-10"` |
| `className="text-[#1B2A4A]"` (back button) | `className="text-[#9CA3AF] hover:text-[#F9FAFB]"` |
| `className="font-bold text-xl text-[#1B2A4A]"` (header h1) | `className="font-bold text-xl text-[#F9FAFB]"` |
| `className="size-20 bg-gray-100 rounded-full` | `className="size-20 bg-[#1F2937] rounded-full` |
| `className="text-gray-500 text-center mb-6"` | `className="text-[#9CA3AF] text-center mb-6"` |
| `className="w-full bg-[#1B2A4A] hover:bg-[#243660]"` (empty state button) | `className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"` |
| `className="bg-white rounded-xl shadow-sm p-4 border border-[#EEE9DF] cursor-pointer hover:shadow-md transition-shadow"` | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/20 transition-colors"` |
| `<Play className="size-8 text-[#C9A84C]" />` (fallback play icon) | `<Play className="size-8 text-[#3B82F6]" />` |
| `className="text-sm text-gray-800 line-clamp-2 mb-2"` | `className="text-sm text-[#F9FAFB] line-clamp-2 mb-2"` |
| `className="flex items-center gap-3 text-xs text-gray-500"` | `className="flex items-center gap-3 text-xs text-[#9CA3AF]"` |
| `className="inline-flex items-center bg-[#1B2A4A] text-white text-xs px-2 py-0.5 rounded-full font-semibold"` | `className="inline-flex items-center bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full font-semibold"` |
| `className="text-xs h-6 px-2 text-[#C9A84C] hover:text-[#1B2A4A]"` (View Analysis btn) | `className="text-xs h-6 px-2 text-[#3B82F6] hover:text-[#F9FAFB]"` |
| `className="flex items-center gap-1 text-xs text-gray-500"` (Analyzing…) | `className="flex items-center gap-1 text-xs text-[#9CA3AF]"` |
| `className="text-xs h-6 px-2 text-[#1B2A4A] hover:bg-[#EEE9DF]"` (Analyze btn) | `className="text-xs h-6 px-2 text-[#3B82F6] hover:bg-[#374151]"` |
| `className="shrink-0 text-gray-400 hover:text-red-600"` (delete btn) | `className="shrink-0 text-[#9CA3AF] hover:text-red-400"` |
| `className="p-4 text-center text-white/70 text-sm"` (modal footer) | unchanged (already white on black) |

**Step 2: Verify**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/screens/History.tsx
git commit -m "style: apply dark theme to History screen"
```

---

### Task 4: Recolor Recording.tsx

**Files:**
- Modify: `src/app/screens/Recording.tsx`

**Step 1: Apply color changes**

Make these targeted replacements in `src/app/screens/Recording.tsx`:

| Old | New |
|-----|-----|
| `className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col"` | `className="min-h-screen bg-[#111827] flex flex-col"` |
| `className="inline-flex items-center justify-center size-20 bg-red-100 rounded-full mb-4"` | `className="inline-flex items-center justify-center size-20 bg-red-900/30 rounded-full mb-4"` |
| `className="font-bold text-xl text-gray-900 mb-3"` | `className="font-bold text-xl text-[#F9FAFB] mb-3"` |
| `className="text-gray-600 mb-6"` (error body) | `className="text-[#9CA3AF] mb-6"` |
| `className="w-full bg-[#1B2A4A] hover:bg-[#243660]"` (Try Again) | `className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"` |
| `className="w-full"` (Go Back outline btn) | `className="w-full border-white/20 text-[#F9FAFB] hover:bg-white/10"` |
| `className="min-h-screen bg-gradient-to-b from-[#FAF8F4] to-white flex flex-col"` | `className="min-h-screen bg-[#111827] flex flex-col"` |
| `className="text-[#1B2A4A]"` (back arrow button) | `className="text-[#9CA3AF] hover:text-[#F9FAFB]"` |
| `className="font-bold text-xl text-[#1B2A4A] flex-1 text-center"` (header h1) | `className="font-bold text-xl text-[#F9FAFB] flex-1 text-center"` |
| `className="bg-white rounded-2xl shadow-lg p-4 mb-6"` (prompt card) | `className="bg-[#1F2937] rounded-2xl p-4 mb-6 border border-white/10"` |
| `className="text-base text-gray-700 leading-relaxed text-center"` (prompt text) | `className="text-base text-[#F9FAFB] leading-relaxed text-center"` |
| `className="inline-flex items-center justify-center size-32 bg-[#EEE9DF] rounded-full mb-6"` | `className="inline-flex items-center justify-center size-32 bg-[#1F2937] rounded-full mb-6"` |
| `<Video className="size-16 text-[#C9A84C]" />` | `<Video className="size-16 text-[#3B82F6]" />` |
| `className="text-gray-600 mb-8"` (description text) | `className="text-[#9CA3AF] mb-8"` |
| `className="w-full h-14 text-lg bg-[#1B2A4A] hover:bg-[#243660] rounded-xl"` (Start Recording) | `className="w-full h-14 text-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"` |

**Step 2: Verify**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/screens/Recording.tsx
git commit -m "style: apply dark theme to Recording screen"
```

---

### Task 5: Recolor Dashboard.tsx

**Files:**
- Modify: `src/app/screens/Dashboard.tsx`

**Step 1: Update ScoreBar component** (lines 9–30)

Replace the `ScoreBar` function with:

```tsx
function ScoreBar({ label, score, explanation }: { label: string; score: number; explanation?: string }) {
  if (score == null || isNaN(score)) return null;
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#F59E0B' : '#ef4444';
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[#F9FAFB]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 bg-[#374151] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {explanation && (
        <p className="text-xs text-[#9CA3AF] mt-0.5">{explanation}</p>
      )}
    </div>
  );
}
```

**Step 2: Update ScoreRing component** (lines 32–49)

Replace the `ScoreRing` function with:

```tsx
function ScoreRing({ score, label }: { score: number; label: string }) {
  if (score == null || isNaN(score)) return null;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#F59E0B' : '#ef4444';
  return (
    <div className="flex flex-col items-center justify-center bg-[#1F2937] rounded-2xl p-6 border border-white/10">
      <div className="text-5xl font-black mb-1" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <div className="text-sm text-[#9CA3AF] mb-2">out of 10</div>
      <div
        className="text-base font-bold px-3 py-1 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}
```

**Step 3: Update loading state** (line 93–98)

Replace:
```tsx
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
      <div className="text-center text-gray-500">Loading analysis...</div>
    </div>
```
With:
```tsx
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <div className="text-center text-[#9CA3AF]">Loading analysis...</div>
    </div>
```

**Step 4: Update not-found state** (lines 100–114)

Replace:
```tsx
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      <header className="p-4 flex items-center gap-3 bg-white border-b border-[#EEE9DF]">
        <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
          <ArrowLeft className="size-5 text-[#1B2A4A]" />
        </Button>
        <h1 className="font-bold text-xl text-[#1B2A4A]">Analysis</h1>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <p className="text-gray-500 text-center">No analysis found for this recording.</p>
      </main>
    </div>
```
With:
```tsx
    <div className="min-h-screen bg-[#111827] flex flex-col">
      <header className="p-4 flex items-center gap-3 bg-[#111827] border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
          <ArrowLeft className="size-5 text-[#9CA3AF]" />
        </Button>
        <h1 className="font-bold text-xl text-[#F9FAFB]">Analysis</h1>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <p className="text-[#9CA3AF] text-center">No analysis found for this recording.</p>
      </main>
    </div>
```

**Step 5: Update main return** (lines 120 onward)

Apply these replacements:

| Old | New |
|-----|-----|
| `className="min-h-screen bg-[#FAF8F4]"` (outer div) | `className="min-h-screen bg-[#111827]"` |
| `className="p-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#EEE9DF] z-10"` | `className="p-4 flex items-center gap-3 sticky top-0 bg-[#111827] border-b border-white/10 z-10"` |
| `<ArrowLeft className="size-5 text-[#1B2A4A]" />` (header back) | `<ArrowLeft className="size-5 text-[#9CA3AF]" />` |
| `<Mic className="size-4 text-[#C9A84C]" />` | `<Mic className="size-4 text-[#3B82F6]" />` |
| `className="font-bold text-xl text-[#1B2A4A]"` (header SpeakDaily) | `className="font-bold text-xl text-[#F9FAFB]"` |
| `className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm"` (prompt card) | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-1"` (Topic label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-1"` |
| `className="text-sm text-[#1B2A4A] leading-relaxed"` (prompt text) | `className="text-sm text-[#F9FAFB] leading-relaxed"` |
| `className="bg-[#1B2A4A] rounded-xl p-4 text-white shadow-md"` (summary card) | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-2"` (Assessment label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-2"` |
| `className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm"` (breakdown card) | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-4"` (Breakdown label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-4"` |
| `className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm"` (fillers card) | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold"` (Filler Words label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold"` |
| `className="text-xs bg-[#EEE9DF] text-[#1B2A4A] px-2 py-0.5 rounded-full font-bold"` (total badge) | `className="text-xs bg-[#374151] text-[#F9FAFB] px-2 py-0.5 rounded-full font-bold"` |
| `className="flex items-center gap-1 bg-[#FAF8F4] border border-[#EEE9DF] rounded-full px-3 py-1 text-sm"` (chip) | `className="flex items-center gap-1 bg-[#374151] border border-white/10 rounded-full px-3 py-1 text-sm"` |
| `className="font-medium text-[#1B2A4A]"` (chip word) | `className="font-medium text-[#F9FAFB]"` |
| `className="text-gray-500"` (chip count `× N`) | `className="text-[#9CA3AF]"` |
| `className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm"` (coaching tips card) | `className="bg-[#1F2937] rounded-xl p-4 border border-white/10"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-3"` (Coaching Tips label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-3"` |
| `className="flex gap-2 text-sm text-[#1B2A4A]"` (tip li) | `className="flex gap-2 text-sm text-[#F9FAFB]"` |
| `className="text-[#C9A84C] font-bold mt-0.5"` (bullet) | `className="text-[#3B82F6] font-bold mt-0.5"` |
| `className="bg-white rounded-xl border border-[#EEE9DF] shadow-sm overflow-hidden"` (transcript card) | `className="bg-[#1F2937] rounded-xl border border-white/10 overflow-hidden"` |
| `className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold"` (Transcription label) | `className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold"` |
| `<ChevronUp className="size-4 text-gray-400" />` | `<ChevronUp className="size-4 text-[#9CA3AF]" />` |
| `<ChevronDown className="size-4 text-gray-400" />` | `<ChevronDown className="size-4 text-[#9CA3AF]" />` |
| `className="text-sm text-gray-700 leading-relaxed"` (transcript text) | `className="text-sm text-[#9CA3AF] leading-relaxed"` |

**Step 6: Verify**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 7: Commit**

```bash
git add src/app/screens/Dashboard.tsx
git commit -m "style: apply dark theme to Dashboard screen"
```

---

### Task 6: Final verification

**Step 1: Run dev server**

```bash
npm run dev
```

**Step 2: Verify each screen**

- **Home** (`/`): Dark bg, prompt card with blue label, plain "New topic" link, blue "Start Recording" button. No feature grid. No info box.
- **History** (`/history`): Dark bg, dark cards, blue score badge, blue action buttons.
- **Recording** (`/recording` — navigate from home): Dark bg, dark prompt card, blue video icon, blue "Start Recording" button.
- **Dashboard** (`/dashboard/:id` — navigate from a completed analysis): Dark bg, dark cards, blue section labels, amber/green/red scores, dark filler chips.

**Step 3: Final commit if any last-minute tweaks were needed**

```bash
git add -p
git commit -m "style: ui redesign final tweaks"
```
