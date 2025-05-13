import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useCharacter } from "@/lib/stores/useCharacter";

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu = ({ onStart }: MainMenuProps) => {
  const { toggleMute, isMuted } = useAudio();
  const { start } = useGame();
  const { selectedCharacter, resetCharacter } = useCharacter();
  const [showContinue, setShowContinue] = useState(false);
  
  // Check if there's a saved character to show continue option
  useEffect(() => {
    setShowContinue(selectedCharacter !== null);
  }, [selectedCharacter]);
  
  const handleNewGame = () => {
    console.log("New Game button clicked");
    resetCharacter(); // Reset any existing character
    onStart(); // Navigate to character selection
  };
  
  const handleContinue = () => {
    console.log("Continue button clicked");
    start(); // Resume the game
    onStart(); // Skip character selection if we already have a character
  };
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite`
            }}
          />
        ))}
      </div>
      
      {/* Game title */}
      <motion.h1
        className="text-5xl md:text-7xl font-bold text-white mb-8 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="text-blue-400">COSMIC</span> ODYSSEY
      </motion.h1>
      
      <motion.div
        className="text-xl text-gray-300 mb-12 text-center max-w-md z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        A space-themed adventure for critical thinkers and strategists
      </motion.div>
      
      {/* Menu buttons */}
      <motion.div
        className="flex flex-col gap-4 z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        <Button 
          variant="default" 
          size="lg" 
          className="w-64 text-lg"
          onClick={handleNewGame}
        >
          New Game
        </Button>
        
        {showContinue && (
          <Button 
            variant="outline" 
            size="lg" 
            className="w-64 text-lg"
            onClick={handleContinue}
          >
            Continue
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="lg" 
          className="w-64 text-lg"
          onClick={toggleMute}
        >
          {isMuted ? "Sound: Off" : "Sound: On"}
        </Button>
      </motion.div>
      
      {/* Credits */}
      <motion.div
        className="absolute bottom-4 text-gray-500 text-sm z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        © 2023 Cosmic Odyssey
      </motion.div>
    </div>
  );
};

export default MainMenu;
