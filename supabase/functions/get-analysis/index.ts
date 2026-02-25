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

    if (!assemblyResponse.ok) {
      const errText = await assemblyResponse.text()
      console.error('AssemblyAI poll HTTP error:', assemblyResponse.status, errText)
      await supabase
        .from('analyses')
        .update({ status: 'error', error_message: `AssemblyAI HTTP ${assemblyResponse.status}`, updated_at: new Date().toISOString() })
        .eq('id', analysis.id)
      return new Response(
        JSON.stringify({ status: 'error', error: `AssemblyAI error: ${assemblyResponse.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
      return new Response(
        JSON.stringify({ status: 'processing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // AssemblyAI is done — extract data
    const transcript = assemblyData.text || ''
    const wordsPerMinute = assemblyData.words && assemblyData.audio_duration
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
        score_explanations: feedback.score_explanations,
        filler_word_breakdown: fillerBreakdown,
        filler_word_total: fillerTotal,
        feedback_points: feedback.feedback_points,
        summary: feedback.summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysis.id)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ status: 'error', error: 'Failed to save analysis results' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
