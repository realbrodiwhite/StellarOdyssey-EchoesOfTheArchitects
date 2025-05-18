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

  // Text content for the intro scenes
  const scenes = [
    {
      text: "In the year 2157, humanity's expansion into the stars revealed ancient artifacts of mysterious origin.",
      duration: 6000,
      voiceover: "intro_scene_1"
    },
    {
      text: "The discovery of these 'Architect Relics' changed everything we thought we knew about our place in the universe.",
      duration: 6000,
      voiceover: "intro_scene_2"
    },
    {
      text: "You are an elite operative of the Stellar Alliance, dispatched to the edge of known space to investigate a newly discovered artifact.",
      duration: 7000,
      voiceover: "intro_scene_3"
    },
    {
      text: "Your mission: to unravel the secrets of these ancient technologies before they fall into the wrong hands.",
      duration: 6000,
      voiceover: "intro_scene_4"
    },
    {
      text: "What you discover may not only change the course of human history but reveal the true nature of our existence among the stars.",
      duration: 7000,
      voiceover: "intro_scene_5"
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
    
    // Set intro stage as starting point and initialize Act 1
    gameProgress.setStage(GameStage.Intro);
    console.log("Starting game from Act 1");
    
    return () => clearTimeout(timer);
  }, [gameProgress]);

  // Progress through scenes automatically
  useEffect(() => {
    if (isLoading) return;
    
    // If we reached the end of scenes, complete the cutscene
    if (currentScene >= scenes.length) {
      console.log("Intro cutscene complete");
      onComplete();
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
    // Play a sound if not muted
    if (!isMuted) {
      playSuccess();
    }
    onSkip();
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
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container"></div>
      </div>
      
      {/* Scene model here - would be a 3D model of spaceship or relevant imagery */}
      <div className="w-full h-3/4 flex items-center justify-center">
        <div className="text-center p-6 relative z-10">
          <motion.h2 
            key={`scene-${currentScene}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl font-space-mono mb-8 leading-relaxed max-w-3xl"
          >
            {scenes[currentScene].text}
          </motion.h2>
        </div>
      </div>
      
      {/* Skip button */}
      {showSkip && (
        <div 
          className="absolute bottom-8 right-8 px-4 py-2 bg-gray-800 bg-opacity-70 rounded cursor-pointer hover:bg-opacity-90 transition-all duration-200"
          onClick={handleSkip}
        >
          Skip Intro
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="absolute bottom-8 left-8 flex space-x-2">
        {scenes.map((_, index) => (
          <div 
            key={`indicator-${index}`} 
            className={`w-2 h-2 rounded-full ${index === currentScene ? 'bg-white' : 'bg-gray-500'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default IntroCutscene;