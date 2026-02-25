import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, BarChart2, Loader2, Play, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { getRecordings, deleteRecording, type Recording } from "../utils/recordings";
import { analyzeRecording, type Analysis } from "../utils/analysis";
import { supabase } from "../utils/supabase";
import { analytics } from "../utils/analytics";
import { toast } from "sonner";

export function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});

  useEffect(() => {
    loadRecordings();
    analytics.pageView("History");

    const celebrate = (location.state as any)?.celebrate;
    if (celebrate) {
      const durationSeconds = (location.state as any)?.durationSeconds;
      toast.success("Great rep. Keep climbing.", {
        description:
          typeof durationSeconds === "number"
            ? `You just finished a ${formatTime(durationSeconds)} rep. Keep climbing.`
            : "You just finished a rep. Keep climbing.",
        duration: 5000,
      });

      // Clear the navigation state so it doesn't re-toast on back/forward
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

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

  const loadRecordings = async () => {
    const loadedRecordings = await getRecordings();
    setRecordings(loadedRecordings);
    analytics.viewHistory(loadedRecordings.length);
    await loadAnalyses(loadedRecordings.map(r => r.id));
  };

  const handleAnalyze = async (recording: Recording, event: React.MouseEvent) => {
    event.stopPropagation();
    if (analyzingIds.has(recording.id)) return;
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

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Delete this recording?")) {
      await deleteRecording(id);
      analytics.deleteRecording(id);
      loadRecordings();
      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
      }
    }
  };

  const handlePlayRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    analytics.playRecording(recording.id, recording.duration);
  };

  const closePlayer = () => {
    setSelectedRecording(null);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      const mm = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const ss = secs.toString().padStart(2, "0");
      return `${hours}:${mm}:${ss}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-[#111827] border-b border-white/10 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-[#9CA3AF] hover:text-[#F9FAFB]"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="font-bold text-xl text-[#F9FAFB]">My Reps</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="size-20 bg-[#1F2937] rounded-full flex items-center justify-center mb-4">
              <Play className="size-10 text-[#9CA3AF]" />
            </div>
            <p className="text-[#9CA3AF] text-center mb-6">
              No recordings yet. Start practicing to see your recordings here!
            </p>
            <Button onClick={() => navigate("/")} className="w-1/3 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              Start Your Rep
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => handlePlayRecording(recording)}
                className="bg-[#1F2937] rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Thumbnail/Play Button */}
                  <div className="shrink-0 size-20 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {recording.thumbnailUrl ? (
                      <>
                        <img 
                          src={recording.thumbnailUrl} 
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="size-8 text-white drop-shadow-lg" />
                        </div>
                      </>
                    ) : (
                      <Play className="size-8 text-[#3B82F6]" />
                    )}
                  </div>

                  {/* Recording Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F9FAFB] line-clamp-2 mb-2">
                      {recording.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                      <span>{formatTime(recording.duration)}</span>
                      <span>•</span>
                      <span>{formatDate(recording.createdAt)}</span>
                    </div>
                    {/* Analysis Button */}
                    <div className="mt-2">
                      {analyses[recording.id] ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                            {analyses[recording.id].overall_score?.toFixed(1) ?? '--'} / 10
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2 text-[#3B82F6] hover:text-[#F9FAFB]"
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
                        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                          <Loader2 className="size-3 animate-spin" />
                          Analyzing...
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 text-[#3B82F6] hover:bg-[#374151]"
                          onClick={(e) => handleAnalyze(recording, e)}
                        >
                          <BarChart2 className="size-3 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-[#9CA3AF] hover:text-red-400"
                    onClick={(e) => handleDelete(recording.id, e)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm line-clamp-1">
                {selectedRecording.prompt}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closePlayer}
              className="text-white hover:bg-white/10 ml-2"
            >
              <X className="size-5" />
            </Button>
          </header>

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <div className="w-full max-w-4xl h-full flex items-center justify-center">
              <video
                src={selectedRecording.videoUrl}
                controls
                autoPlay
                className="w-full h-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 text-center text-white/70 text-sm">
            <span>{formatTime(selectedRecording.duration)}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(selectedRecording.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
