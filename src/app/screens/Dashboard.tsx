import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ChevronDown, ChevronUp, Mic } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../utils/supabase";
import { getRecordings, type Recording } from "../utils/recordings";
import type { Analysis } from "../utils/analysis";

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
    try {
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
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setRecording(null);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-center text-[#9CA3AF]">Loading analysis...</div>
      </div>
    );
  }

  if (!analysis || !recording) {
    return (
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
    );
  }

  const scores = analysis.scores;
  const scoreExplanations = analysis.score_explanations;
  const fillers = analysis.filler_word_breakdown || [];

  return (
    <div className="min-h-screen bg-[#111827]">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-[#111827] border-b border-white/10 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
          <ArrowLeft className="size-5 text-[#9CA3AF]" />
        </Button>
        <div className="flex items-center gap-2">
          <Mic className="size-4 text-[#3B82F6]" />
          <h1 className="font-bold text-xl text-[#F9FAFB]">SpeakDaily</h1>
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
        <div className="bg-[#1F2937] rounded-xl p-4 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-1">Topic</p>
          <p className="text-sm text-[#F9FAFB] leading-relaxed">{recording.prompt}</p>
        </div>

        {/* Overall Score */}
        {analysis.overall_score != null && analysis.overall_label && (
          <ScoreRing score={analysis.overall_score} label={analysis.overall_label} />
        )}

        {/* Summary */}
        {analysis.summary && (
          <div className="bg-[#1F2937] rounded-xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-2">Assessment</p>
            <p className="text-sm text-[#F9FAFB] leading-relaxed">{analysis.summary}</p>
          </div>
        )}

        {/* Score Breakdown */}
        {scores && (
          <div className="bg-[#1F2937] rounded-xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-4">Breakdown</p>
            <ScoreBar label="Vocal Variety" score={scores.vocal_variety} explanation={scoreExplanations?.vocal_variety} />
            <ScoreBar label="Tonality" score={scores.tonality} explanation={scoreExplanations?.tonality} />
            <ScoreBar label="Word Choice" score={scores.word_choice} explanation={scoreExplanations?.word_choice} />
            <ScoreBar label="Filler Words" score={scores.filler_words} explanation={scoreExplanations?.filler_words} />
          </div>
        )}

        {/* Filler Words */}
        {fillers.length > 0 && (
          <div className="bg-[#1F2937] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold">Filler Words</p>
              <span className="text-xs bg-[#374151] text-[#F9FAFB] px-2 py-0.5 rounded-full font-bold">
                {analysis.filler_word_total ?? 0} total
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fillers.map(({ word, count }) => (
                <div
                  key={word}
                  className="flex items-center gap-1 bg-[#374151] border border-white/10 rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-medium text-[#F9FAFB]">"{word}"</span>
                  <span className="text-[#9CA3AF]">× {count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Points */}
        {analysis.feedback_points && analysis.feedback_points.length > 0 && (
          <div className="bg-[#1F2937] rounded-xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold mb-3">Coaching Tips</p>
            <ul className="space-y-2">
              {analysis.feedback_points.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#F9FAFB]">
                  <span className="text-[#3B82F6] font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcription */}
        {analysis.transcript && (
          <div className="bg-[#1F2937] rounded-xl border border-white/10 overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between text-left"
              onClick={() => setTranscriptExpanded(e => !e)}
            >
              <p className="text-xs uppercase tracking-wide text-[#3B82F6] font-semibold">Transcription</p>
              {transcriptExpanded
                ? <ChevronUp className="size-4 text-[#9CA3AF]" />
                : <ChevronDown className="size-4 text-[#9CA3AF]" />}
            </button>
            {transcriptExpanded && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{analysis.transcript}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
