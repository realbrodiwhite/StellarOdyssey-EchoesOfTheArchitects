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
      
      {/* Earth-like planet with moon debris rings - moved to left and up */}
      <div className="absolute z-5" style={{ 
        bottom: "30vh",
        left: "30%", 
        transform: "translateX(-50%)",
        width: "25vh",
        height: "25vh",
        opacity: 1,
        filter: "drop-shadow(0 0 15px rgba(120,180,255,0.3))"
      }}>
        {/* Planet body */}
        <div className="absolute rounded-full" style={{ 
          width: "100%", 
          height: "100%",
          background: "radial-gradient(circle at 35% 35%, #2978a0 0%, #1c5985 30%, #0a3861 70%, #0a1933 100%)",
          boxShadow: "inset -2px -2px 5px rgba(0,0,0,0.5), 0 0 3px rgba(100,200,255,0.4)"
        }}>
          {/* Continental details */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='rgba(70,140,50,0.5)' d='M30,30 Q40,20 50,30 T70,30 Q75,40 65,50 T70,70 Q60,75 50,65 T30,70 Q25,60 35,50 T30,30 Z'/%3E%3C/svg%3E")`,
            backgroundSize: "cover",
            opacity: 0.7
          }}></div>
          
          {/* Atmosphere glow */}
          <div className="absolute" style={{
            width: "110%", 
            height: "110%",
            top: "-5%",
            left: "-5%",
            background: "radial-gradient(circle at center, transparent 50%, rgba(100,180,255,0.1) 70%, rgba(100,180,255,0.2) 90%, rgba(100,180,255,0.1) 100%)"
          }}></div>
        </div>
        
        {/* Outer ring with debris */}
        <div className="absolute" style={{
          width: "300%",
          height: "5vh",
          top: "50%",
          left: "-100%",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(150,150,170,0.4) 30%, rgba(220,220,230,0.7) 50%, rgba(150,150,170,0.4) 70%, rgba(0,0,0,0) 100%)",
          boxShadow: "0 0 15px rgba(255,255,255,0.3)",
          opacity: 0.85
        }}></div>
        
        {/* Middle ring */}
        <div className="absolute" style={{
          width: "240%",
          height: "3.5vh",
          top: "49%",
          left: "-70%",
          transform: "translateY(-50%) rotate(-20deg)",
          borderRadius: "50%",
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(180,180,200,0.5) 30%, rgba(240,240,250,0.8) 50%, rgba(180,180,200,0.5) 70%, rgba(0,0,0,0) 100%)",
          boxShadow: "0 0 10px rgba(255,255,255,0.3)",
          opacity: 0.9
        }}></div>
        
        {/* Inner ring */}
        <div className="absolute" style={{
          width: "160%",
          height: "2.5vh",
          top: "50.5%",
          left: "-30%",
          transform: "translateY(-50%) rotate(25deg)",
          borderRadius: "50%",
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(200,200,220,0.6) 30%, rgba(255,255,255,0.9) 50%, rgba(200,200,220,0.6) 70%, rgba(0,0,0,0) 100%)",
          boxShadow: "0 0 8px rgba(255,255,255,0.3)",
          opacity: 0.95
        }}></div>
        
        {/* Larger rock chunks in rings */}
        <div className="absolute rounded-full bg-gray-200" style={{ width: "2.2%", height: "2.2%", top: "49.3%", left: "37%", opacity: 0.85, boxShadow: "0 0 5px rgba(0,0,0,0.5)" }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "3.5%", height: "3.5%", top: "48.2%", left: "-38%", opacity: 0.9, boxShadow: "0 0 8px rgba(0,0,0,0.6)" }}></div>
        <div className="absolute rounded-full bg-gray-200" style={{ width: "1.7%", height: "1.7%", top: "50.7%", left: "72%", opacity: 0.8, boxShadow: "0 0 4px rgba(0,0,0,0.4)" }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "2.8%", height: "2.8%", top: "49.5%", left: "-79%", opacity: 0.85, boxShadow: "0 0 6px rgba(0,0,0,0.5)" }}></div>
      </div>
      
      {/* Game title */}
      <div
        className="font-bold text-white mb-8 sm:mb-10 md:mb-12 z-10 px-4 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="title-container items-center justify-center">
            {/* Desktop and tablet version (single line) */}
            <div className="hidden sm:flex items-center justify-center text-[4.5rem] md:text-[5.5rem] lg:text-[6.3rem]">
              <span className="stellar-text">STELLAR</span><span className="odyssey-text">ODYSSEY</span>
            </div>
            
            {/* Mobile version (two lines) with first line smaller - perfectly centered */}
            <div className="flex flex-col sm:hidden items-center justify-center w-full px-3 text-center gap-6">
              <div className="stellar-text text-[1.9rem] animate-fade-slide-in" style={{ marginLeft: "-20%", position: "relative", display: "inline-block", transform: "skewX(-15deg)" }}>STELLAR</div>
              <div className="odyssey-text w-full text-[5.5rem] text-center mx-auto flex justify-center items-center">ODYSSEY</div>
            </div>
          </div>
          <div className="text-[0.5rem] sm:text-[0.8rem] md:text-[1rem] lg:text-[1.2rem] w-[100%] mx-auto text-center font-bold shimmer-text mt-4">ECHOES OF THE ARCHITECTS</div>
        </div>
      </div>
      
      {/* Menu buttons with different colors */}
      <motion.div
        className="menu-buttons-container z-10 justify-center mt-12"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'newGame' ? 'pulse-button' : ''}`} 
          onClick={handleNewGame}
          onMouseEnter={() => setActiveButton('newGame')}
        >
          NEW GAME
        </motion.div>
        
        {showContinue && (
          <motion.div 
            className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'loadGame' ? 'pulse-button' : ''}`} 
            onClick={handleLoadGame}
            onMouseEnter={() => setActiveButton('loadGame')}
          >
            LOAD GAME
          </motion.div>
        )}
        
        <motion.div 
          className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'settings' ? 'pulse-button' : ''}`} 
          onClick={() => setShowSettings(true)}
          onMouseEnter={() => setActiveButton('settings')}
        >
          SETTINGS
        </motion.div>
      </motion.div>
      
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
        © 2025 Brodi Branded Inc. All rights reserved.
      </motion.div>
    </div>
  );
};

export default MainMenu;
