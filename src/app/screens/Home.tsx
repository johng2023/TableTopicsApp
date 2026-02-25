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
      <main className="mx-auto flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="text-center mb-10">
  <h2 className="text-3xl font-bold text-[#F9FAFB] mb-3 leading-tight">
    Practice speaking.<br />Get better every day.
  </h2>
  <p className="text-[#9CA3AF] text-base max-w-xs mx-auto leading-relaxed">
    Answer a random Table Topics prompt, record your response, and get 
    AI-powered Toastmasters feedback in seconds.
  </p>
</div>
        {/* Prompt Card */}
        <div className="w-full bg-[#1F2937] rounded-2xl p-6 mb-5 border border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#3B82F6] font-semibold mb-3">
            Your Practice Topic
          </p>
          <p className="text-lg leading-relaxed text-[#F9FAFB] min-h-[80px]">
            {prompt}
          </p>
        </div>

        {/* New Topic Link */}
        <button
          type="button"
          onClick={handleNewPrompt}
          className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] mb-8 self-center transition-colors"
        >
          <RefreshCw className="size-3.5" />
          New topic
        </button>

        {/* CTA Button */}
        <Button
          onClick={handleStartRecording}
          className="mx-auto h-14 text-lg font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
        >
          Start Recording
        </Button>
      </main>
    </div>
  );
}
