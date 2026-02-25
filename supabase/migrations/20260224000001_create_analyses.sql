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
