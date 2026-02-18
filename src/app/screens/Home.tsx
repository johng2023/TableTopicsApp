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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <h1 className="font-bold text-xl text-blue-900">Daily Table Topics</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/history")}
          className="text-blue-700"
        >
          <History className="size-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Hero Section - Simplified */}
        <div className="pt-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Master Table Topics<br />
            <span className="text-blue-600">Anytime, Anywhere</span>
          </h2>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            Practice impromptu speaking daily and build confidence
          </p>
        </div>

        {/* Main Action Area - Prominent */}
        <div className="w-full max-w-md mx-auto mb-6">
          {/* Prompt Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-blue-100">
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
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
            className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xl mb-3 relative"
          >
            <div className="flex items-center justify-center gap-2">
              <Mic className="size-6" />
              <span>Start Recording</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              GO
            </div>
          </Button>

          {/* Secondary Action */}
          <Button
            onClick={handleNewPrompt}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
          >
            <RefreshCw className="size-4 mr-2" />
            Get a Different Topic
          </Button>
        </div>

        {/* Benefits Section - Collapsed/Simplified */}
        <div className="w-full max-w-md mx-auto mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-md">
            <h3 className="font-bold text-sm mb-2 text-center">Why Toastmasters Love This</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-50">
              <div className="flex items-start gap-1.5">
                <span className="text-blue-200 mt-0.5">✓</span>
                <span>Practice between meetings</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-blue-200 mt-0.5">✓</span>
                <span>Review & improve</span>
              </div>
              <div className="flex items-start gap-1.5 col-span-2">
                <span className="text-blue-200 mt-0.5">✓</span>
                <span>Build confidence to speak up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Benefits Grid - Less Prominent */}
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 text-center">
            <TrendingUp className="size-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Confidence</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 text-center">
            <Clock className="size-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Daily</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 text-center">
            <Target className="size-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Progress</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 text-center">
            <Award className="size-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Excel</p>
          </div>
        </div>
      </main>
    </div>
  );
}