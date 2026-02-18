import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import { initGA } from "./utils/analytics";
import { Toaster } from "sonner";

// Replace with your Google Analytics 4 Measurement ID
// Get it from: https://analytics.google.com/
const GA_MEASUREMENT_ID = "G-VJB6T2QF33";

export default function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA(GA_MEASUREMENT_ID);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}