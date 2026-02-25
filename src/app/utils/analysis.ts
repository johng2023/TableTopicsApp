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
  try {
    const response = await callFunction('/analyze-recording', {
      method: 'POST',
      body: JSON.stringify({ recording_id }),
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function pollAnalysis(recording_id: string): Promise<AnalysisPollResult> {
  try {
    const response = await callFunction(`/get-analysis?recording_id=${recording_id}`)
    if (!response.ok) return { status: 'error', error: 'Network error' }
    return response.json()
  } catch {
    return { status: 'error', error: 'Network error' }
  }
}

/**
 * Starts analysis and polls every 5 seconds until complete or error.
 * Calls onStatusChange on each poll with current status.
 * Returns the final Analysis or null on error/timeout.
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

export async function getExistingAnalysis(recording_id: string): Promise<Analysis | null> {
  const { data } = await supabase
    .from('analyses')
    .select('*')
    .eq('recording_id', recording_id)
    .eq('status', 'complete')
    .maybeSingle()
  return data as Analysis | null
}
