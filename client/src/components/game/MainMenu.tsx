import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useCharacter } from "@/lib/stores/useCharacter";
import PuzzleSelector from "./PuzzleSelector";
import SaveLoadMenu from "./SaveLoadMenu";
import Settings from "./Settings";

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu = ({ onStart }: MainMenuProps) => {
  const { toggleMute, isMuted } = useAudio();
  const { start } = useGame();
  const { character, resetCharacter } = useCharacter();
  const [showContinue, setShowContinue] = useState(false);
  const [showPuzzleSelector, setShowPuzzleSelector] = useState(false);
  const [showSaveLoadMenu, setShowSaveLoadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Check if there's a saved character to show load game option
  useEffect(() => {
    setShowContinue(character && character.id !== '');
  }, [character]);
  
  useEffect(() => {
    // Load audio on component mount
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    // Load emergency encounter sounds
    const alarmSound = new Audio('/sounds/alarm.mp3');
    const explosionSound = new Audio('/sounds/explosion.mp3');
    
    // Store audio in state management
    const { 
      setBackgroundMusic, 
      setHitSound, 
      setSuccessSound,
      setAlarmSound,
      setExplosionSound 
    } = useAudio.getState();
    
    setBackgroundMusic(backgroundMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    setAlarmSound(alarmSound);
    setExplosionSound(explosionSound);
    
    console.log("Audio files loaded");
  }, []);
  
  const handleNewGame = () => {
    console.log("New Game button clicked");
    resetCharacter(); // Reset any existing character
    // Play success sound for feedback
    const { playSuccess } = useAudio.getState();
    playSuccess();
    onStart(); // Navigate to character selection
  };
  
  const handleLoadGame = () => {
    console.log("Load Game button clicked");
    setShowSaveLoadMenu(true);
  };
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Stars background - responsive based on viewport size */}
      <div className="absolute inset-0 z-0">
        {[...Array(Math.min(120, Math.max(40, Math.floor(window.innerWidth / 10))))].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
              height: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite`
            }}
          />
        ))}
      </div>
      
      {/* Game title */}
      <motion.div
        className="font-bold text-white mb-8 sm:mb-10 md:mb-12 z-10 px-4 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl"><span className="text-blue-400">STELLAR</span> ODYSSEY</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.5em] font-light shimmer-text">ECHOES OF THE ARCHITECTS</div>
        </div>
      </motion.div>
      
      <motion.div
        className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 md:mb-12 text-center max-w-xs sm:max-w-sm md:max-w-md z-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        A space-themed adventure for critical thinkers and strategists
      </motion.div>
      
      {/* Menu buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-2 z-10 w-full max-w-[150px] sm:max-w-[400px] justify-center px-4 mt-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        <div className="game-button text-[10px] py-1 px-3" onClick={handleNewGame}>
          New Game
        </div>
        
        {showContinue && (
          <div className="game-button text-[10px] py-1 px-3 outline" onClick={handleLoadGame}>
            Load Game
          </div>
        )}
        
        <div className="game-button text-[10px] py-1 px-3 outline" onClick={() => setShowPuzzleSelector(true)}>
          Puzzle Showcase
        </div>
        
        <div className="game-button text-[10px] py-1 px-3 ghost" onClick={() => setShowSettings(true)}>
          Settings
        </div>
      </motion.div>
      
      {/* Modals */}
      {showPuzzleSelector && <PuzzleSelector onClose={() => setShowPuzzleSelector(false)} />}
      
      {/* Save/Load Menu */}
      <SaveLoadMenu 
        isOpen={showSaveLoadMenu} 
        onClose={() => setShowSaveLoadMenu(false)} 
        mode="load" 
      />
      
      {/* Settings Menu */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Debug buttons */}
      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-xs text-gray-500 z-10">
        <div>Game Phase: {useGame.getState().phase}</div>
        {character && character.id && <div>Character: {character.name}</div>}
      </div>
      
      {/* Credits */}
      <motion.div
        className="absolute bottom-2 sm:bottom-3 md:bottom-4 text-gray-500 text-xs sm:text-sm z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        © 2025 Brodi Branded Inc.
      </motion.div>
    </div>
  );
};

export default MainMenu;
