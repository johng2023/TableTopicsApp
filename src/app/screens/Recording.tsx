import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Square, Video, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { saveRecording } from "../utils/recordings";
import { analytics } from "../utils/analytics";

export function Recording() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;

  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const startedAtMsRef = useRef<number | null>(null);
  const finalDurationSecondsRef = useRef<number>(0);

  // Redirect to home if no prompt provided
  useEffect(() => {
    if (!prompt) {
      navigate("/", { replace: true });
    } else {
      analytics.pageView("Recording");
    }
  }, [prompt, navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const generateThumbnailBlob = (videoBlob: Blob): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      const objectUrl = URL.createObjectURL(videoBlob);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
  
      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };
  
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
  
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(blob); // returns Blob | null
        }, "image/jpeg", 0.8);
      };
  
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null); // null means no thumbnail, that's fine
      };
    });
  };

  const startRecording = async () => {
    setError(null);
    try {
      // Request camera and microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: true 
      });
      streamRef.current = stream;
      
      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];
      startedAtMsRef.current = Date.now();
      finalDurationSecondsRef.current = 0;
      setSeconds(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const durationSeconds = finalDurationSecondsRef.current;
        
        const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
const videoBlob = new Blob(videoChunksRef.current, { type: mimeType });
        const thumbnailBlob = await generateThumbnailBlob(videoBlob);

        await saveRecording({
          id: Date.now().toString(),
          prompt,
          audioUrl: '',
          videoBlob,
          thumbnailBlob: thumbnailBlob ?? undefined, 
          duration: durationSeconds,
          createdAt: new Date(),
        });
      
        analytics.stopRecording(durationSeconds);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        navigate('/history', { state: { celebrate: true, durationSeconds } });
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsReady(true);

      // Track analytics
      analytics.startRecording(prompt);

      timerRef.current = setInterval(() => {
        const startedAt = startedAtMsRef.current;
        if (!startedAt) return;
        const elapsedSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        finalDurationSecondsRef.current = elapsedSeconds;
        setSeconds(elapsedSeconds);
      }, 1000);
    } catch (err: any) {
      console.error("Camera/Microphone error:", err);
      
      let errorMessage = "Could not access camera and microphone. ";
      
      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow camera and microphone access in your browser settings and try again.";
        analytics.cameraPermissionDenied();
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera or microphone found. Please connect them and try again.";
        analytics.cameraError("NotFoundError");
      } else {
        errorMessage += "Please check your camera, microphone, and browser permissions.";
        analytics.cameraError(err.name || "UnknownError");
      }
      
      setError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      const startedAt = startedAtMsRef.current;
      const elapsedSeconds =
        startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : seconds;
      finalDurationSecondsRef.current = elapsedSeconds;
      setSeconds(elapsedSeconds);

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    startRecording();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
        <header className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-gray-700"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center size-20 bg-red-100 rounded-full mb-4">
              <AlertCircle className="size-10 text-red-600" />
            </div>
            <h2 className="font-bold text-xl text-gray-900 mb-3">Camera & Microphone Access Required</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={handleTryAgain}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        {!isRecording && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-blue-700"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        {isRecording && <div className="size-10" />}
        <h1 className="font-bold text-xl text-blue-900 flex-1 text-center">
          {isReady ? "Recording" : "Ready to Record"}
        </h1>
        <div className="size-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className="w-full max-w-md">
          {/* Prompt Display */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <p className="text-base text-gray-700 leading-relaxed text-center">{prompt}</p>
          </div>

          {!isReady ? (
            /* Start Recording View */
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-32 bg-blue-100 rounded-full mb-6">
                <Video className="size-16 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-8">
                Click the button below to start recording your video response
              </p>
              <Button
                onClick={startRecording}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                <Video className="size-5 mr-2" />
                Start Recording
              </Button>
            </div>
          ) : (
            /* Recording In Progress View */
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Recording indicator overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                  <span className="size-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
                {/* Timer overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-2xl font-bold">
                  {formatTime(seconds)}
                </div>
              </div>

              {/* Stop Button */}
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 rounded-xl"
              >
                <Square className="size-5 mr-2 fill-current" />
                Stop Recording
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}