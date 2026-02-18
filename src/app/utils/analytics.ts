// Google Analytics 4 utility functions

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const initGA = (measurementId: string) => {
  // Add GA script to head
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    console.log("Analytics event:", eventName, eventParams);
  }
};

// Predefined event tracking functions
export const analytics = {
  // Page views
  pageView: (pageName: string) => {
    trackEvent("page_view", { page_title: pageName });
  },

  // Recording events
  startRecording: (prompt: string) => {
    trackEvent("start_recording", { prompt_text: prompt });
  },

  stopRecording: (duration: number) => {
    trackEvent("stop_recording", { recording_duration: duration });
  },

  // History events
  viewHistory: (recordingCount: number) => {
    trackEvent("view_history", { total_recordings: recordingCount });
  },

  playRecording: (recordingId: string, duration: number) => {
    trackEvent("play_recording", {
      recording_id: recordingId,
      recording_duration: duration,
    });
  },

  deleteRecording: (recordingId: string) => {
    trackEvent("delete_recording", { recording_id: recordingId });
  },

  // Prompt events
  generatePrompt: (prompt: string) => {
    trackEvent("generate_prompt", { prompt_text: prompt });
  },

  // Error events
  cameraPermissionDenied: () => {
    trackEvent("camera_permission_denied");
  },

  cameraError: (errorType: string) => {
    trackEvent("camera_error", { error_type: errorType });
  },
};
