import { useState, useEffect } from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { motion } from 'framer-motion';
import { useGameProgress, GameStage } from '../../lib/stores/useGameProgress';

interface IntroCutsceneProps {
  onComplete: () => void;
  onSkip: () => void;
}

const IntroCutscene = ({ onComplete, onSkip }: IntroCutsceneProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const gameProgress = useGameProgress();
  const { setStage } = gameProgress;
  const { successSound, isMuted, playSuccess } = useAudio.getState();

  // Text content for the intro scenes - limited to 3 concise slides
  const scenes = [
    {
      text: "The discovery of ancient alien artifacts in 2157 revealed that humanity is not alone. These 'Architect Relics' contain advanced technologies beyond our understanding.",
      duration: 8000,
      voiceover: "intro_scene_1"
    },
    {
      text: "The Hegemony, which governs both the Core Galaxies and Outer Rim territories, has laid claim to a newly discovered region called The Far Reach, where powerful artifacts have been found.",
      duration: 8000,
      voiceover: "intro_scene_2"
    },
    {
      text: "As an elite operative, you've been dispatched to investigate a newly discovered artifact. Your decisions will shape the future of humanity among the stars.",
      duration: 8000,
      voiceover: "intro_scene_3"
    }
  ];

  // Load model and prepare cutscene
  useEffect(() => {
    console.log("Loading intro cutscene");
    
    // Simulate loading of assets
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("Intro cutscene assets loaded");
      
      // Start showing skip button after 2 seconds
      setTimeout(() => {
        setShowSkip(true);
      }, 2000);
    }, 2000);
    
    // Set intro stage as starting point
    gameProgress.setStage(GameStage.Intro);
    
    return () => clearTimeout(timer);
  }, [gameProgress]);

  // Progress through scenes automatically
  useEffect(() => {
    if (isLoading) return;
    
    // If we reached the end of scenes, complete the cutscene
    if (currentScene >= scenes.length) {
      console.log("Intro cutscene complete");
      
      // Fade out with black screen before calling onComplete
      document.body.style.backgroundColor = 'black';
      
      // Delay the transition to prevent multiple screens
      setTimeout(() => {
        onComplete();
      }, 500);
      
      return;
    }
    
    // Try to play sound for current scene transition
    if (!isMuted) {
      try {
        // Play a subtle sound when transitioning between scenes
        playSuccess();
        console.log(`Playing sound for scene ${currentScene + 1}`);
      } catch (error: any) {
        console.error("Error playing scene transition sound:", error);
      }
    }
    
    // Advance to next scene after current scene duration
    const timer = setTimeout(() => {
      setCurrentScene(prev => prev + 1);
    }, scenes[currentScene].duration);
    
    return () => clearTimeout(timer);
  }, [currentScene, isLoading, onComplete, isMuted, playSuccess, scenes]);

  // Handle skip button click
  const handleSkip = () => {
    console.log("Cutscene skipped, proceeding to first mission");
    
    // Fade out with black screen first
    document.body.style.backgroundColor = 'black';
    
    // Play a sound if not muted
    if (!isMuted) {
      playSuccess();
    }
    
    // Delay the transition slightly to ensure clean transition
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading intro sequence...</div>
      </div>
    );
  }

  // If we've reached the end of scenes
  if (currentScene >= scenes.length) {
    return null; // This will be cleaned up by the useEffect
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white relative">
      {/* Starfield background with subtle parallax effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container"></div>
      </div>
      
      {/* Centered slide content with fade transitions */}
      <div className="w-full max-w-4xl mx-auto px-6 flex items-center justify-center h-full relative z-10">
        <motion.div
          key={`scene-${currentScene}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold mb-6 leading-relaxed"
          >
            {scenes[currentScene].text.split('.')[0]}
          </motion.h2>
          
          {scenes[currentScene].text.split('.').length > 1 && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              {scenes[currentScene].text.split('.').slice(1).join('.').trim()}
            </motion.p>
          )}
        </motion.div>
      </div>
      
      {/* Skip button */}
      {showSkip && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 right-8 px-5 py-2.5 bg-blue-900 bg-opacity-80 rounded-lg cursor-pointer hover:bg-blue-800 transition-all duration-200 shadow-lg border border-blue-700"
          onClick={handleSkip}
        >
          Skip Intro
        </motion.div>
      )}
      
      {/* Progress indicator */}
      <div className="absolute bottom-8 left-8 flex space-x-3">
        {scenes.map((_, index) => (
          <div 
            key={`indicator-${index}`} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentScene 
                ? 'bg-blue-400 w-5' 
                : index < currentScene 
                  ? 'bg-blue-700' 
                  : 'bg-gray-700'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default IntroCutscene;