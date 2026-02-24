# SpeakDaily Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered Toastmasters feedback dashboard to TabelTopicsApp and rebrand it as SpeakDaily with a navy/gold theme.

**Architecture:** On-demand analysis triggered from History screen — user taps "Analyze", which calls two Supabase Edge Functions: one kicks off AssemblyAI transcription and returns immediately, the other polls AssemblyAI, then calls Claude for structured feedback, saves results to a new `analyses` Supabase table, and returns the full analysis to the frontend. A new Dashboard screen displays scores, transcript, filler words, and coaching tips.

**Tech Stack:** React + Vite + TypeScript, Tailwind v4, shadcn/ui (Radix), Supabase (Postgres + Storage + Edge Functions), AssemblyAI API, Anthropic Claude API (`claude-sonnet-4-6`).

---

## Prerequisites (read before starting)

- Supabase project is already live (env vars in `.env` file: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Install Supabase CLI if not present: `brew install supabase/tap/supabase`
- You will need API keys for AssemblyAI (https://www.assemblyai.com) and Anthropic — set these as Supabase secrets (see Task 3)
- No test framework exists in this project — each task includes manual browser verification steps instead
- Run `npm install` (or `pnpm install`) in the project root before starting

---

## Task 1: Theme Rebrand — CSS Variables

**Goal:** Replace blue palette with navy/gold SpeakDaily palette.

**Files:**
- Modify: `src/styles/theme.css`

**Step 1: Open `src/styles/theme.css` and replace the entire `:root` block**

Replace the current `:root` block (lines 3–42) with:

```css
:root {
  --font-size: 16px;
  --background: #FAF8F4;
  --foreground: #1B2A4A;
  --card: #FFFFFF;
  --card-foreground: #1B2A4A;
  --popover: #FFFFFF;
  --popover-foreground: #1B2A4A;
  --primary: #1B2A4A;
  --primary-foreground: #FFFFFF;
  --secondary: #EEE9DF;
  --secondary-foreground: #1B2A4A;
  --muted: #EEE9DF;
  --muted-foreground: #6B6552;
  --accent: #C9A84C;
  --accent-foreground: #1B2A4A;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(27, 42, 74, 0.12);
  --input: transparent;
  --input-background: #F0ECE5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #C9A84C;
  --chart-1: #C9A84C;
  --chart-2: #1B2A4A;
  --chart-3: #4A6FA5;
  --chart-4: #8B9DC3;
  --chart-5: #EEE9DF;
  --radius: 0.625rem;
  --sidebar: #1B2A4A;
  --sidebar-foreground: #FAF8F4;
  --sidebar-primary: #C9A84C;
  --sidebar-primary-foreground: #1B2A4A;
  --sidebar-accent: #243660;
  --sidebar-accent-foreground: #FAF8F4;
  --sidebar-border: rgba(255,255,255,0.1);
  --sidebar-ring: #C9A84C;
}
```

**Step 2: Verify in browser**

Run `npm run dev`, open the app. The background should be warm off-white, not white. Check that buttons are navy, not blue.

**Step 3: Commit**

```bash
cd /Users/johnguckian/TabelTopicsApp
git add src/styles/theme.css
git commit -m "feat: rebrand theme to SpeakDaily navy/gold palette"
```

---

## Task 2: Theme Rebrand — Copy & Branding

**Goal:** Rename app to SpeakDaily, update all copy to aspirational tone.

**Files:**
- Modify: `index.html`
- Modify: `src/app/screens/Home.tsx`
- Modify: `src/app/screens/Recording.tsx`
- Modify: `src/app/screens/History.tsx`

**Step 1: Update `index.html` title**

Find `<title>` tag and replace its content:
```html
<title>SpeakDaily — Become the best speaker in your club</title>
```

**Step 2: Update `src/app/screens/Home.tsx`**

Make these targeted replacements:

| Find | Replace |
|------|---------|
| `Daily Table Topics` | `SpeakDaily` |
| `Master Table Topics<br />` | `Become the best speaker` |
| `<span className="text-blue-600">Anytime, Anywhere</span>` | `<span style={{color: 'var(--accent)'}}>in your club.</span>` |
| `Practice impromptu speaking daily and build confidence` | `Get Toastmasters-grade feedback on every practice rep.` |
| `Start Recording` (button label) | `Start Your Rep` |
| `text-blue-900` | `text-[#1B2A4A]` (all occurrences) |
| `text-blue-600` | `text-[#C9A84C]` (all occurrences) |
| `text-blue-700` | `text-[#1B2A4A]` (all occurrences) |
| `bg-blue-600` | `bg-[#1B2A4A]` (all occurrences) |
| `hover:bg-blue-700` | `hover:bg-[#243660]` (all occurrences) |
| `border-blue-100` | `border-[#EEE9DF]` (all occurrences) |
| `border-blue-300` | `border-[#C9A84C]` (all occurrences) |
| `hover:bg-blue-50` | `hover:bg-[#FAF8F4]` |
| `from-blue-50 via-white to-blue-50` | `from-[#FAF8F4] via-white to-[#FAF8F4]` |
| `Why Toastmasters Love This` | `Built for Toastmasters` |
| `from-blue-600 to-blue-700` | `from-[#1B2A4A] to-[#243660]` |

**Step 3: Update `src/app/screens/Recording.tsx`**

| Find | Replace |
|------|---------|
| `Daily Table Topics` | `SpeakDaily` |
| `text-blue-900` | `text-[#1B2A4A]` |
| `text-blue-700` | `text-[#1B2A4A]` |
| `text-blue-600` | `text-[#C9A84C]` |
| `bg-blue-600` | `bg-[#1B2A4A]` |
| `hover:bg-blue-700` | `hover:bg-[#243660]` |
| `from-blue-50 to-white` | `from-[#FAF8F4] to-white` |
| `bg-blue-100` | `bg-[#EEE9DF]` |

**Step 4: Update `src/app/screens/History.tsx`**

| Find | Replace |
|------|---------|
| `My Recordings` | `My Reps` |
| `text-blue-900` | `text-[#1B2A4A]` |
| `text-blue-700` | `text-[#1B2A4A]` |
| `bg-blue-600` | `bg-[#1B2A4A]` |
| `hover:bg-blue-700` | `hover:bg-[#243660]` |
| `from-blue-50 to-white` | `from-[#FAF8F4] to-white` |
| `Congrats on practicing today!` | `Great rep. Keep climbing.` |
| `You just finished a` | `You just finished a` (keep) |
| `practice rep. Keep it up.` | `rep. Keep climbing.` |

**Step 5: Verify in browser**

- Home: says "SpeakDaily" in header, "Become the best speaker in your club." hero, "Start Your Rep" button
- History: says "My Reps" in header
- All blues replaced with navy/gold

**Step 6: Commit**

```bash
git add index.html src/app/screens/Home.tsx src/app/screens/Recording.tsx src/app/screens/History.tsx
git commit -m "feat: update copy and branding to SpeakDaily"
```

---

## Task 3: Supabase Local Setup & Analyses Table Migration

**Goal:** Initialize Supabase CLI locally and create the `analyses` table.

**Files:**
- Create: `supabase/migrations/20260224000001_create_analyses.sql`

**Step 1: Initialize Supabase CLI (if not already done)**

```bash
cd /Users/johnguckian/TabelTopicsApp
supabase init
```

If it asks to overwrite, say no — just need the `supabase/` folder structure.

**Step 2: Link to your Supabase project**

```bash
supabase link
```

This will prompt for your project ref (find it in your Supabase dashboard URL: `https://supabase.com/dashboard/project/<ref>`).

**Step 3: Create the migration file**

Create `supabase/migrations/20260224000001_create_analyses.sql` with:

```sql
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id text NOT NULL,
  assemblyai_id text,
  status text NOT NULL DEFAULT 'processing',
  transcript text,
  overall_score numeric,
  overall_label text,
  scores jsonb,
  filler_word_breakdown jsonb,
  filler_word_total integer,
  feedback_points jsonb,
  summary text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_recording_id_idx ON analyses(recording_id);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Allow all operations (app uses device_id auth, not Supabase auth)
CREATE POLICY "Allow all" ON analyses FOR ALL USING (true) WITH CHECK (true);
```

**Step 4: Apply the migration to your remote Supabase project**

```bash
supabase db push
```

Expected: migration applied successfully.

**Step 5: Set Edge Function secrets**

```bash
supabase secrets set ASSEMBLYAI_API_KEY=your_assemblyai_key_here
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key_here
```

Get AssemblyAI key from: https://www.assemblyai.com/dashboard
Get Anthropic key from: https://console.anthropic.com

**Step 6: Verify in Supabase dashboard**

Open your Supabase project → Table Editor → confirm `analyses` table exists with the correct columns.

**Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add analyses table migration and supabase init"
```

---

## Task 4: Edge Function — `analyze-recording`

**Goal:** Supabase Edge Function that receives a `recording_id`, fetches the video URL, submits it to AssemblyAI, saves the pending analysis row, and returns immediately.

**Files:**
- Create: `supabase/functions/analyze-recording/index.ts`

**Step 1: Create the Edge Function**

```bash
cd /Users/johnguckian/TabelTopicsApp
supabase functions new analyze-recording
```

**Step 2: Replace the generated file content**

Write `supabase/functions/analyze-recording/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recording_id } = await req.json()

    if (!recording_id) {
      return new Response(
        JSON.stringify({ error: 'recording_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check if analysis already exists for this recording
    const { data: existing } = await supabase
      .from('analyses')
      .select('id, status')
      .eq('recording_id', recording_id)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ analysis_id: existing.id, status: existing.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the recording to get video URL
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('video_url, prompt')
      .eq('id', recording_id)
      .single()

    if (recordingError || !recording) {
      return new Response(
        JSON.stringify({ error: 'Recording not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Submit to AssemblyAI
    const assemblyResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': Deno.env.get('ASSEMBLYAI_API_KEY')!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: recording.video_url,
        sentiment_analysis: true,
        filter_profanity: false,
        speech_threshold: 0.2,
      }),
    })

    if (!assemblyResponse.ok) {
      const errText = await assemblyResponse.text()
      console.error('AssemblyAI error:', errText)
      return new Response(
        JSON.stringify({ error: 'Failed to submit to AssemblyAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const assemblyData = await assemblyResponse.json()

    // Save analysis row
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        recording_id,
        assemblyai_id: assemblyData.id,
        status: 'processing',
      })
      .select('id')
      .single()

    if (insertError || !analysis) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ analysis_id: analysis.id, status: 'processing' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 3: Deploy the function**

```bash
supabase functions deploy analyze-recording --no-verify-jwt
```

Expected output: `Deployed Function analyze-recording`

**Step 4: Smoke test with curl**

Replace `<SUPABASE_URL>` and `<ANON_KEY>` with your values and `<RECORDING_ID>` with a real ID from your database:

```bash
curl -X POST '<SUPABASE_URL>/functions/v1/analyze-recording' \
  -H 'Authorization: Bearer <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"recording_id": "<RECORDING_ID>"}'
```

Expected: `{"analysis_id":"...","status":"processing"}`

Check your Supabase `analyses` table — a new row should exist with `status = 'processing'`.

**Step 5: Commit**

```bash
git add supabase/functions/analyze-recording/
git commit -m "feat: add analyze-recording edge function"
```

---

## Task 5: Edge Function — `get-analysis`

**Goal:** Polls AssemblyAI for transcript status. When complete, extracts filler words and audio metrics, calls Claude for structured feedback, saves results, and returns the full analysis.

**Files:**
- Create: `supabase/functions/get-analysis/index.ts`

**Step 1: Create the Edge Function**

```bash
supabase functions new get-analysis
```

**Step 2: Write the function**

Write `supabase/functions/get-analysis/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'basically', 'literally', 'actually', 'right', 'okay', 'well']

function countFillerWords(transcript: string): { word: string; count: number }[] {
  const lower = transcript.toLowerCase()
  const counts: { word: string; count: number }[] = []
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lower.match(regex)
    if (matches && matches.length > 0) {
      counts.push({ word: filler, count: matches.length })
    }
  }
  return counts.sort((a, b) => b.count - a.count)
}

function buildClaudePrompt(params: {
  prompt: string
  duration: number
  transcript: string
  wordsPerMinute: number
  fillerBreakdown: { word: string; count: number }[]
  fillerTotal: number
  sentimentData: unknown
}): string {
  const fillerSummary = params.fillerBreakdown.length > 0
    ? params.fillerBreakdown.map(f => `"${f.word}" × ${f.count}`).join(', ')
    : 'none detected'

  return `You are an experienced Toastmasters speech evaluator scoring a Table Topics response.

Table Topics Prompt: "${params.prompt}"
Recording Duration: ${params.duration} seconds
Words Per Minute: ${params.wordsPerMinute || 'unknown'}
Filler Words: ${fillerSummary} (total: ${params.fillerTotal})
Sentiment Data: ${JSON.stringify(params.sentimentData)}

Full Transcript:
"""
${params.transcript}
"""

Evaluate this speech against Toastmasters Table Topics standards. Table Topics responses are typically 1-2 minutes. Score ruthlessly but fairly.

Return ONLY a valid JSON object (no markdown, no explanation) matching this exact structure:
{
  "overall_score": <number 1-10, one decimal>,
  "overall_label": <"Needs Work" | "Developing" | "Competent" | "Strong" | "Exceptional">,
  "scores": {
    "vocal_variety": <number 1-10>,
    "tonality": <number 1-10>,
    "word_choice": <number 1-10>,
    "filler_words": <number 1-10, inverse scoring: 10=zero fillers, 1=excessive fillers>
  },
  "score_explanations": {
    "vocal_variety": <one sentence explanation>,
    "tonality": <one sentence explanation>,
    "word_choice": <one sentence explanation>,
    "filler_words": <one sentence explanation>
  },
  "feedback_points": [<3-5 actionable coaching tips as strings>],
  "summary": "<2-3 sentence overall assessment>"
}

Do NOT evaluate gestures or body language. Evaluate speech and language only.`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const recording_id = url.searchParams.get('recording_id')

    if (!recording_id) {
      return new Response(
        JSON.stringify({ error: 'recording_id query param required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch analysis row
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('recording_id', recording_id)
      .maybeSingle()

    if (fetchError || !analysis) {
      return new Response(
        JSON.stringify({ status: 'not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Already complete or errored — return immediately
    if (analysis.status === 'complete' || analysis.status === 'error') {
      return new Response(
        JSON.stringify({ status: analysis.status, data: analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch recording for prompt + duration
    const { data: recording } = await supabase
      .from('recordings')
      .select('prompt, duration')
      .eq('id', recording_id)
      .single()

    // Poll AssemblyAI
    const assemblyResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${analysis.assemblyai_id}`,
      { headers: { 'Authorization': Deno.env.get('ASSEMBLYAI_API_KEY')! } }
    )

    const assemblyData = await assemblyResponse.json()

    if (assemblyData.status === 'error') {
      await supabase
        .from('analyses')
        .update({ status: 'error', error_message: assemblyData.error, updated_at: new Date().toISOString() })
        .eq('id', analysis.id)

      return new Response(
        JSON.stringify({ status: 'error', error: assemblyData.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (assemblyData.status !== 'completed') {
      // Still processing
      return new Response(
        JSON.stringify({ status: 'processing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // AssemblyAI is done — extract data
    const transcript = assemblyData.text || ''
    const wordsPerMinute = assemblyData.words
      ? Math.round((assemblyData.words.length / (assemblyData.audio_duration / 60)))
      : 0
    const sentimentData = assemblyData.sentiment_analysis_results || []
    const fillerBreakdown = countFillerWords(transcript)
    const fillerTotal = fillerBreakdown.reduce((sum, f) => sum + f.count, 0)

    // Call Claude
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: buildClaudePrompt({
          prompt: recording?.prompt || '',
          duration: recording?.duration || 0,
          transcript,
          wordsPerMinute,
          fillerBreakdown,
          fillerTotal,
          sentimentData,
        }),
      }],
    })

    const rawContent = claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : ''

    let feedback: Record<string, unknown>
    try {
      feedback = JSON.parse(rawContent)
    } catch {
      console.error('Claude JSON parse error. Raw:', rawContent)
      await supabase
        .from('analyses')
        .update({ status: 'error', error_message: 'Claude returned invalid JSON', updated_at: new Date().toISOString() })
        .eq('id', analysis.id)

      return new Response(
        JSON.stringify({ status: 'error', error: 'AI feedback parsing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save results
    const { data: updated, error: updateError } = await supabase
      .from('analyses')
      .update({
        status: 'complete',
        transcript,
        overall_score: feedback.overall_score,
        overall_label: feedback.overall_label,
        scores: feedback.scores,
        filler_word_breakdown: fillerBreakdown,
        filler_word_total: fillerTotal,
        feedback_points: feedback.feedback_points,
        summary: feedback.summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysis.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
    }

    return new Response(
      JSON.stringify({ status: 'complete', data: updated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 3: Deploy**

```bash
supabase functions deploy get-analysis --no-verify-jwt
```

**Step 4: Smoke test**

Use the `analysis_id` returned from the `analyze-recording` smoke test in Task 4. Wait ~30 seconds then:

```bash
curl '<SUPABASE_URL>/functions/v1/get-analysis?recording_id=<RECORDING_ID>' \
  -H 'Authorization: Bearer <ANON_KEY>'
```

Expected first call: `{"status":"processing"}`
Expected after ~60s: `{"status":"complete","data":{...}}`

**Step 5: Commit**

```bash
git add supabase/functions/get-analysis/
git commit -m "feat: add get-analysis edge function with AssemblyAI + Claude pipeline"
```

---

## Task 6: Frontend — Analysis Utility

**Goal:** Frontend functions to call the two Edge Functions and poll for results.

**Files:**
- Create: `src/app/utils/analysis.ts`

**Step 1: Create `src/app/utils/analysis.ts`**

```typescript
import { supabase } from './supabase'

export interface ScoreBreakdown {
  vocal_variety: number
  tonality: number
  word_choice: number
  filler_words: number
}

export interface ScoreExplanations {
  vocal_variety: string
  tonality: string
  word_choice: string
  filler_words: string
}

export interface FillerWord {
  word: string
  count: number
}

export interface Analysis {
  id: string
  recording_id: string
  status: 'processing' | 'complete' | 'error'
  transcript: string | null
  overall_score: number | null
  overall_label: string | null
  scores: ScoreBreakdown | null
  score_explanations?: ScoreExplanations | null
  filler_word_breakdown: FillerWord[] | null
  filler_word_total: number | null
  feedback_points: string[] | null
  summary: string | null
  error_message?: string | null
  created_at: string
  updated_at: string
}

export type AnalysisPollResult =
  | { status: 'not_found' }
  | { status: 'processing' }
  | { status: 'error'; error: string }
  | { status: 'complete'; data: Analysis }

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function callFunction(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${FUNCTIONS_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

export async function startAnalysis(recording_id: string): Promise<{ analysis_id: string; status: string } | null> {
  const response = await callFunction('/analyze-recording', {
    method: 'POST',
    body: JSON.stringify({ recording_id }),
  })

  if (!response.ok) return null
  return response.json()
}

export async function pollAnalysis(recording_id: string): Promise<AnalysisPollResult> {
  const response = await callFunction(`/get-analysis?recording_id=${recording_id}`)
  if (!response.ok) return { status: 'error', error: 'Network error' }
  return response.json()
}

/**
 * Starts analysis and polls every 5 seconds until complete or error.
 * Calls onStatusChange on each poll with the current status.
 * Returns the final Analysis or null on error.
 */
export async function analyzeRecording(
  recording_id: string,
  onStatusChange?: (status: string) => void
): Promise<Analysis | null> {
  await startAnalysis(recording_id)
  onStatusChange?.('processing')

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const result = await pollAnalysis(recording_id)

      if (result.status === 'complete') {
        clearInterval(interval)
        resolve(result.data)
      } else if (result.status === 'error') {
        clearInterval(interval)
        resolve(null)
      } else {
        onStatusChange?.(result.status)
      }
    }, 5000)

    // Safety timeout: stop polling after 3 minutes
    setTimeout(() => {
      clearInterval(interval)
      resolve(null)
    }, 180_000)
  })
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to `analysis.ts`.

**Step 3: Commit**

```bash
git add src/app/utils/analysis.ts
git commit -m "feat: add analysis utility functions for edge function polling"
```

---

## Task 7: History Screen — Analyze Button & Status

**Goal:** Add "Analyze" and "View Analysis" buttons to recording cards. Handle polling state.

**Files:**
- Modify: `src/app/screens/History.tsx`

**Step 1: Add imports at the top of History.tsx**

Add to existing imports:

```tsx
import { BarChart2, Loader2 } from "lucide-react";
import { analyzeRecording, type Analysis } from "../utils/analysis";
import { useNavigate } from "react-router";  // already imported
```

**Step 2: Add state for analysis statuses**

Inside the `History` component, after existing state declarations, add:

```tsx
const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
```

**Step 3: Add loadAnalyses function and call it on mount**

After `loadRecordings`, add:

```tsx
const loadAnalyses = async (recordingIds: string[]) => {
  if (recordingIds.length === 0) return;
  const { data } = await supabase
    .from('analyses')
    .select('*')
    .in('recording_id', recordingIds)
    .eq('status', 'complete');

  if (data) {
    const map: Record<string, Analysis> = {};
    data.forEach((a: Analysis) => { map[a.recording_id] = a; });
    setAnalyses(map);
  }
};
```

Update the `loadRecordings` function to call `loadAnalyses` after loading:

```tsx
const loadRecordings = async () => {
  const loadedRecordings = await getRecordings();
  setRecordings(loadedRecordings);
  analytics.viewHistory(loadedRecordings.length);
  await loadAnalyses(loadedRecordings.map(r => r.id));
};
```

**Step 4: Add handleAnalyze function**

```tsx
const handleAnalyze = async (recording: Recording, event: React.MouseEvent) => {
  event.stopPropagation();

  setAnalyzingIds(prev => new Set(prev).add(recording.id));

  const result = await analyzeRecording(recording.id);

  setAnalyzingIds(prev => {
    const next = new Set(prev);
    next.delete(recording.id);
    return next;
  });

  if (result) {
    setAnalyses(prev => ({ ...prev, [recording.id]: result }));
  }
};
```

**Step 5: Add the Analyze / View Analysis button to each recording card**

Inside the recording card's info section (after the duration/date line), add:

```tsx
{/* Analysis Button */}
<div className="mt-2">
  {analyses[recording.id] ? (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 bg-[#1B2A4A] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
        {analyses[recording.id].overall_score?.toFixed(1)} / 10
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-6 px-2 text-[#C9A84C] hover:text-[#1B2A4A]"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dashboard/${recording.id}`);
        }}
      >
        <BarChart2 className="size-3 mr-1" />
        View Analysis
      </Button>
    </div>
  ) : analyzingIds.has(recording.id) ? (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <Loader2 className="size-3 animate-spin" />
      Analyzing...
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs h-6 px-2 text-[#1B2A4A] hover:bg-[#EEE9DF]"
      onClick={(e) => handleAnalyze(recording, e)}
    >
      <BarChart2 className="size-3 mr-1" />
      Analyze
    </Button>
  )}
</div>
```

**Step 6: Add supabase import**

Add at the top if not present:
```tsx
import { supabase } from '../utils/supabase';
```

**Step 7: Verify in browser**

- Open History — each recording card should have an "Analyze" button
- Click "Analyze" — button changes to "Analyzing..." spinner
- After ~60-90s — button changes to score pill + "View Analysis"
- "View Analysis" should navigate to `/dashboard/:id` (will 404 until Task 8)

**Step 8: Commit**

```bash
git add src/app/screens/History.tsx
git commit -m "feat: add analyze button and polling to history screen"
```

---

## Task 8: Dashboard Screen

**Goal:** New screen at `/dashboard/:id` showing the full AI analysis.

**Files:**
- Create: `src/app/screens/Dashboard.tsx`

**Step 1: Create `src/app/screens/Dashboard.tsx`**

```tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../utils/supabase";
import { getRecordings, type Recording } from "../utils/recordings";
import type { Analysis } from "../utils/analysis";

function ScoreBar({ label, score, explanation }: { label: string; score: number; explanation?: string }) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#C9A84C' : '#ef4444';
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[#1B2A4A]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 bg-[#EEE9DF] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {explanation && (
        <p className="text-xs text-gray-500 mt-0.5">{explanation}</p>
      )}
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#C9A84C' : '#ef4444';
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 border border-[#EEE9DF]">
      <div
        className="text-5xl font-black mb-1"
        style={{ color }}
      >
        {score.toFixed(1)}
      </div>
      <div className="text-sm text-gray-400 mb-1">out of 10</div>
      <div
        className="text-base font-bold px-3 py-1 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { id: recordingId } = useParams<{ id: string }>();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  useEffect(() => {
    if (!recordingId) {
      navigate('/history', { replace: true });
      return;
    }
    loadData();
  }, [recordingId]);

  const loadData = async () => {
    setLoading(true);

    const [recordings, { data: analysisData }] = await Promise.all([
      getRecordings(),
      supabase
        .from('analyses')
        .select('*')
        .eq('recording_id', recordingId)
        .eq('status', 'complete')
        .maybeSingle(),
    ]);

    const rec = recordings.find(r => r.id === recordingId);
    setRecording(rec || null);
    setAnalysis(analysisData as Analysis | null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-center text-gray-500">Loading analysis...</div>
      </div>
    );
  }

  if (!analysis || !recording) {
    return (
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
    );
  }

  const scores = analysis.scores;
  const scoreExplanations = (analysis as any).score_explanations;
  const fillers = analysis.filler_word_breakdown || [];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#EEE9DF] z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
          <ArrowLeft className="size-5 text-[#1B2A4A]" />
        </Button>
        <div className="flex items-center gap-2">
          <Mic className="size-4 text-[#C9A84C]" />
          <h1 className="font-bold text-xl text-[#1B2A4A]">SpeakDaily</h1>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4 pb-12">
        {/* Video Player */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
          <video
            src={recording.videoUrl}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-1">Topic</p>
          <p className="text-sm text-[#1B2A4A] leading-relaxed">{recording.prompt}</p>
        </div>

        {/* Overall Score */}
        {analysis.overall_score != null && analysis.overall_label && (
          <ScoreRing score={analysis.overall_score} label={analysis.overall_label} />
        )}

        {/* Summary */}
        {analysis.summary && (
          <div className="bg-[#1B2A4A] rounded-xl p-4 text-white shadow-md">
            <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-2">Assessment</p>
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        )}

        {/* Score Breakdown */}
        {scores && (
          <div className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-4">Breakdown</p>
            <ScoreBar label="Vocal Variety" score={scores.vocal_variety} explanation={scoreExplanations?.vocal_variety} />
            <ScoreBar label="Tonality" score={scores.tonality} explanation={scoreExplanations?.tonality} />
            <ScoreBar label="Word Choice" score={scores.word_choice} explanation={scoreExplanations?.word_choice} />
            <ScoreBar label="Filler Words" score={scores.filler_words} explanation={scoreExplanations?.filler_words} />
          </div>
        )}

        {/* Filler Words */}
        {fillers.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold">Filler Words</p>
              <span className="text-xs bg-[#EEE9DF] text-[#1B2A4A] px-2 py-0.5 rounded-full font-bold">
                {analysis.filler_word_total} total
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fillers.map(({ word, count }) => (
                <div
                  key={word}
                  className="flex items-center gap-1 bg-[#FAF8F4] border border-[#EEE9DF] rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-medium text-[#1B2A4A]">"{word}"</span>
                  <span className="text-gray-500">× {count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Points */}
        {analysis.feedback_points && analysis.feedback_points.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-[#EEE9DF] shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold mb-3">Coaching Tips</p>
            <ul className="space-y-2">
              {analysis.feedback_points.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#1B2A4A]">
                  <span className="text-[#C9A84C] font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcription */}
        {analysis.transcript && (
          <div className="bg-white rounded-xl border border-[#EEE9DF] shadow-sm overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between text-left"
              onClick={() => setTranscriptExpanded(e => !e)}
            >
              <p className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold">Transcription</p>
              {transcriptExpanded
                ? <ChevronUp className="size-4 text-gray-400" />
                : <ChevronDown className="size-4 text-gray-400" />}
            </button>
            {transcriptExpanded && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.transcript}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/screens/Dashboard.tsx
git commit -m "feat: add Dashboard screen for AI analysis results"
```

---

## Task 9: Register Route

**Goal:** Add the `/dashboard/:id` route so navigation works.

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/routes.ts`

**Step 1: Check `src/app/routes.ts`**

Open the file and confirm the route structure format used. Add the dashboard route:

```typescript
export const ROUTES = {
  home: '/',
  recording: '/recording',
  history: '/history',
  dashboard: '/dashboard/:id',
}
```

**Step 2: Update `src/app/App.tsx`**

Add the import:
```tsx
import { Dashboard } from './screens/Dashboard';
```

Add the route inside your router configuration. The exact syntax depends on how routes are declared — look for where `History` and `Recording` are added and follow the same pattern:

```tsx
<Route path="/dashboard/:id" element={<Dashboard />} />
```

**Step 3: Verify end-to-end in browser**

Full flow test:
1. Open app → Home screen shows "SpeakDaily" branding ✓
2. Record a new practice rep ✓
3. Go to "My Reps" (History) ✓
4. Tap "Analyze" on a recording → shows "Analyzing..." spinner ✓
5. Wait ~60-90s → shows score badge + "View Analysis" button ✓
6. Tap "View Analysis" → Dashboard screen loads with video, scores, breakdown, filler words, coaching tips ✓

**Step 4: Commit**

```bash
git add src/app/App.tsx src/app/routes.ts
git commit -m "feat: register /dashboard/:id route"
```

---

## Task 10: Final Polish & Environment Docs

**Goal:** Document the required environment variables so future developers can set up the project.

**Files:**
- Create: `.env.example`

**Step 1: Create `.env.example`**

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# These go in Supabase Edge Function secrets (supabase secrets set KEY=value)
# ASSEMBLYAI_API_KEY=your-assemblyai-key
# ANTHROPIC_API_KEY=your-anthropic-key
```

**Step 2: Final build check**

```bash
npm run build
```

Expected: clean build, no errors, no warnings about missing env vars.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example with required environment variables"
```

---

## Summary of All New Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260224000001_create_analyses.sql` | Analyses table schema |
| `supabase/functions/analyze-recording/index.ts` | Edge Function — kicks off AssemblyAI |
| `supabase/functions/get-analysis/index.ts` | Edge Function — polls AssemblyAI + calls Claude |
| `src/app/utils/analysis.ts` | Frontend analysis API utilities |
| `src/app/screens/Dashboard.tsx` | AI feedback dashboard screen |
| `.env.example` | Environment variable documentation |

## Summary of Modified Files

| File | Changes |
|------|---------|
| `src/styles/theme.css` | Navy/gold palette |
| `src/app/screens/Home.tsx` | SpeakDaily branding + copy |
| `src/app/screens/Recording.tsx` | Color + header updates |
| `src/app/screens/History.tsx` | Analyze button + analysis state |
| `src/app/App.tsx` | Dashboard route |
| `src/app/routes.ts` | Dashboard route constant |
| `index.html` | Page title |
