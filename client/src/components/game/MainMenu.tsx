import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useCharacter } from "@/lib/stores/useCharacter";
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
  const [showSaveLoadMenu, setShowSaveLoadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeButton, setActiveButton] = useState('newGame');
  
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

  // Create stars for background animation
  const renderStars = () => {
    return [...Array(Math.min(120, Math.max(40, Math.floor(window.innerWidth / 10))))].map((_, i) => (
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
    ));
  };

  // Generate shooting stars animation
  const renderShootingStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="shooting-star"
        style={{
          height: `${Math.random() * 40 + 20}px`,
          left: `${Math.random() * 80}%`,
          top: `${Math.random() * 40}%`,
          animationDelay: `${Math.random() * 10 + i * 3}s`,
          animationDuration: `${Math.random() * 2 + 1}s`,
        }}
      />
    ));
  };
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Stars background with rotation - responsive based on viewport size */}
      <div className="absolute inset-0 z-0 star-field-container">
        <div className="rotating-star-field">
          {renderStars()}
          {renderShootingStars()}
        </div>
      </div>
      
      {/* Game title */}
      <div 
        className="font-bold text-white mb-8 sm:mb-10 md:mb-12 z-10 px-4 text-center"
      >
        <h1 className="jumper-font">JUMPER</h1>
        <h2 className="awakening-font">AWAKENING</h2>
      </div>
      
      {/* Menu - responsive design with centered content */}
      <div className="z-10 bg-black bg-opacity-50 backdrop-blur-sm p-5 sm:p-8 rounded-lg border border-gray-800 w-[90%] max-w-md">
        <div className="flex flex-col space-y-4">
          {/* New Game button */}
          <motion.button
            className={`py-3 px-6 rounded-md text-lg font-medium transition-all ${
              activeButton === 'newGame' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNewGame}
            onMouseEnter={() => setActiveButton('newGame')}
          >
            New Game
          </motion.button>
          
          {/* Continue Game button - only show if a saved character exists */}
          {showContinue && (
            <motion.button
              className={`py-3 px-6 rounded-md text-lg font-medium transition-all ${
                activeButton === 'continue' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLoadGame}
              onMouseEnter={() => setActiveButton('continue')}
            >
              Continue
            </motion.button>
          )}
          
          {/* Load Game button */}
          <motion.button
            className={`py-3 px-6 rounded-md text-lg font-medium transition-all ${
              activeButton === 'load' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLoadGame}
            onMouseEnter={() => setActiveButton('load')}
          >
            Load Game
          </motion.button>
          
          {/* Settings button */}
          <motion.button
            className={`py-3 px-6 rounded-md text-lg font-medium transition-all ${
              activeButton === 'settings' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSettings(true)}
            onMouseEnter={() => setActiveButton('settings')}
          >
            Settings
          </motion.button>
        </div>
        
        {/* Sound toggle button */}
        <motion.button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </motion.button>
      </div>
      
      {/* Version number */}
      <div className="absolute bottom-4 right-4 text-gray-500 text-sm z-10">
        Version 0.1.4
      </div>
      
      {/* Save/Load menu modal */}
      {showSaveLoadMenu && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-900 rounded-lg w-[90%] max-w-2xl overflow-hidden">
            <SaveLoadMenu 
              onClose={() => setShowSaveLoadMenu(false)}
              onLoadCharacter={() => {
                setShowSaveLoadMenu(false);
                onStart();
              }}
            />
          </div>
        </div>
      )}
      
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-900 rounded-lg w-[90%] max-w-lg overflow-hidden">
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;