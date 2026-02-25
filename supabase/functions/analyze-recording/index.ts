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
    let recording_id: string | undefined
    try {
      const body = await req.json()
      recording_id = body?.recording_id
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
