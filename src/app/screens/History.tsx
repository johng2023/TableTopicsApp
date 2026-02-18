import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Play, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { getRecordings, deleteRecording, type Recording } from "../utils/recordings";
import { analytics } from "../utils/analytics";
import { toast } from "sonner";

export function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  useEffect(() => {
    loadRecordings();
    analytics.pageView("History");

    const celebrate = (location.state as any)?.celebrate;
    if (celebrate) {
      const durationSeconds = (location.state as any)?.durationSeconds;
      toast.success("Congrats on practicing today!", {
        description:
          typeof durationSeconds === "number"
            ? `You just finished a ${formatTime(durationSeconds)} practice rep. Keep it up.`
            : "You just finished a practice rep. Keep it up.",
        duration: 5000,
      });

      // Clear the navigation state so it doesn't re-toast on back/forward
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  const loadRecordings = () => {
    const loadedRecordings = getRecordings();
    setRecordings(loadedRecordings);
    analytics.viewHistory(loadedRecordings.length);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Delete this recording?")) {
      deleteRecording(id);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-blue-700"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="font-bold text-xl text-blue-900">My Recordings</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Play className="size-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-6">
              No recordings yet. Start practicing to see your recordings here!
            </p>
            <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
              Start Practicing
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => handlePlayRecording(recording)}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
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
                      <Play className="size-8 text-blue-600" />
                    )}
                  </div>

                  {/* Recording Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                      {recording.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatTime(recording.duration)}</span>
                      <span>•</span>
                      <span>{formatDate(recording.createdAt)}</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-400 hover:text-red-600"
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