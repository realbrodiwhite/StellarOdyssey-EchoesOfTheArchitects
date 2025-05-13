import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import Game from "./pages/game";
import NotFound from "./pages/not-found";
import { queryClient } from "./lib/queryClient";
import { useAudio } from "./lib/stores/useAudio";

function App() {
  // Set up audio on app initialization
  useEffect(() => {
    // Initialize background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    
    // Initialize sound effects
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    
    // Store in our audio state manager
    const audioManager = useAudio.getState();
    audioManager.setBackgroundMusic(bgMusic);
    audioManager.setHitSound(hitSound);
    audioManager.setSuccessSound(successSound);
    
    return () => {
      // Clean up audio resources
      bgMusic.pause();
      hitSound.pause();
      successSound.pause();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
