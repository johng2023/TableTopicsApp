import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mic, RefreshCw, History, TrendingUp, Clock, Target, Award } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F4] via-white to-[#FAF8F4] flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-[#EEE9DF]">
        <h1 className="font-bold text-xl text-[#1B2A4A]">SpeakDaily</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/history")}
          className="text-[#1B2A4A]"
        >
          <History className="size-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Hero Section - Simplified */}
        <div className="pt-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
            Become the best speaker<br />
            <span className="text-[#C9A84C]">in your club.</span>
          </h2>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            Get Toastmasters-grade feedback on every practice rep.
          </p>
        </div>

        {/* Main Action Area - Prominent */}
        <div className="w-full max-w-md mx-auto mb-6">
          {/* Prompt Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-[#EEE9DF]">
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wide text-[#C9A84C] font-semibold">
                Your Practice Topic
              </span>
            </div>
            <p className="text-xl leading-relaxed text-gray-800 min-h-[100px]">
              {prompt}
            </p>
          </div>

          {/* Primary Action Button - Most Prominent */}
          <Button
            onClick={handleStartRecording}
            className="w-full h-16 text-lg font-semibold bg-[#1B2A4A] hover:bg-[#243660] rounded-xl shadow-xl mb-3 relative"
          >
            <div className="flex items-center justify-center gap-2">
              <Mic className="size-6" />
              <span>Start Your Rep</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              GO
            </div>
          </Button>

          {/* Secondary Action */}
          <Button
            onClick={handleNewPrompt}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-[#C9A84C] text-[#1B2A4A] hover:bg-[#FAF8F4] font-medium"
          >
            <RefreshCw className="size-4 mr-2" />
            Get a Different Topic
          </Button>
        </div>

        {/* Benefits Section - Collapsed/Simplified */}
        <div className="w-full max-w-md mx-auto mb-4">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#243660] rounded-xl p-4 text-white shadow-md">
            <h3 className="font-bold text-sm mb-2 text-center">Built for Toastmasters</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#FAF8F4]">
              <div className="flex items-start gap-1.5">
                <span className="text-[#8B9DC3] mt-0.5">✓</span>
                <span>Practice between meetings</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#8B9DC3] mt-0.5">✓</span>
                <span>Review & improve</span>
              </div>
              <div className="flex items-start gap-1.5 col-span-2">
                <span className="text-[#8B9DC3] mt-0.5">✓</span>
                <span>Build confidence to speak up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Benefits Grid - Less Prominent */}
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#EEE9DF] text-center">
            <TrendingUp className="size-5 text-[#C9A84C] mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Confidence</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#EEE9DF] text-center">
            <Clock className="size-5 text-[#C9A84C] mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Daily</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#EEE9DF] text-center">
            <Target className="size-5 text-[#C9A84C] mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Progress</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#EEE9DF] text-center">
            <Award className="size-5 text-[#C9A84C] mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Excel</p>
          </div>
        </div>
      </main>
    </div>
  );
}