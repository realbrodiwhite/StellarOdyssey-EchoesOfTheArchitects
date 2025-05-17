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
      
      {/* Earth-like planet with moon debris rings - moved left and up */}
      <div className="absolute z-5" style={{ 
        bottom: "30vh",
        left: "30%", 
        transform: "translateX(-50%)",
        width: "20vh",
        height: "20vh",
        opacity: 1,
        filter: "drop-shadow(0 0 15px rgba(120,180,255,0.3))"
      }}>
        {/* Realistic Earth-like planet body */}
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
          
          {/* Atmospheric glow */}
          <div className="absolute" style={{
            width: "110%", 
            height: "110%",
            top: "-5%",
            left: "-5%",
            background: "radial-gradient(circle at center, transparent 50%, rgba(100,180,255,0.1) 70%, rgba(100,180,255,0.2) 90%, rgba(100,180,255,0.1) 100%)"
          }}></div>
        </div>
        
        {/* Improved moon debris rings - different sizes and better visibility */}
        
        {/* First major ring - largest, outer ring */}
        <div className="absolute" style={{
          width: "320%",
          height: "0.9vh",
          top: "50%",
          left: "-110%",
          background: "linear-gradient(90deg, transparent 0%, rgba(230,230,240,0.15) 15%, rgba(230,230,240,0.5) 35%, rgba(230,230,240,0.7) 50%, rgba(230,230,240,0.5) 65%, rgba(230,230,240,0.15) 85%, transparent 100%)",
          boxShadow: "0 0 5px rgba(255,255,255,0.4)",
          transform: "translateY(-50%) rotate(12deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Second major ring - medium width, different angle */}
        <div className="absolute" style={{
          width: "250%",
          height: "1.2vh",
          top: "49%",
          left: "-75%",
          background: "linear-gradient(90deg, transparent 0%, rgba(210,210,220,0.2) 20%, rgba(210,210,220,0.8) 40%, rgba(210,210,220,0.95) 50%, rgba(210,210,220,0.8) 60%, rgba(210,210,220,0.2) 80%, transparent 100%)",
          boxShadow: "0 0 6px rgba(255,255,255,0.4)",
          transform: "translateY(-50%) rotate(-18deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Third medium-visible ring - closer to planet */}
        <div className="absolute" style={{
          width: "180%",
          height: "0.8vh",
          top: "50.5%",
          left: "-40%",
          background: "linear-gradient(90deg, transparent 0%, rgba(190,190,200,0.15) 15%, rgba(190,190,200,0.5) 40%, rgba(190,190,200,0.6) 50%, rgba(190,190,200,0.5) 60%, rgba(190,190,200,0.15) 85%, transparent 100%)",
          boxShadow: "0 0 3px rgba(255,255,255,0.2)",
          transform: "translateY(-50%) rotate(28deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Fourth barely visible ring - thin, outer */}
        <div className="absolute" style={{
          width: "350%",
          height: "0.3vh",
          top: "50.3%",
          left: "-125%",
          background: "linear-gradient(90deg, transparent 0%, rgba(180,180,190,0.03) 30%, rgba(180,180,190,0.15) 50%, rgba(180,180,190,0.03) 70%, transparent 100%)",
          transform: "translateY(-50%) rotate(-5deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Fifth barely visible ring - thin, inner */}
        <div className="absolute" style={{
          width: "150%",
          height: "0.25vh",
          top: "49.8%",
          left: "-25%",
          background: "linear-gradient(90deg, transparent 0%, rgba(200,200,210,0.02) 30%, rgba(200,200,210,0.12) 50%, rgba(200,200,210,0.02) 70%, transparent 100%)",
          transform: "translateY(-50%) rotate(5deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Sixth extremely faint ring - dust, inner */}
        <div className="absolute" style={{
          width: "130%",
          height: "0.15vh",
          top: "50.1%",
          left: "-15%",
          background: "linear-gradient(90deg, transparent 0%, rgba(190,190,200,0.01) 30%, rgba(190,190,200,0.06) 50%, rgba(190,190,200,0.01) 70%, transparent 100%)",
          transform: "translateY(-50%) rotate(-8deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* Seventh extremely faint ring - dust, outer */}
        <div className="absolute" style={{
          width: "380%",
          height: "0.1vh",
          top: "49.6%",
          left: "-140%",
          background: "linear-gradient(90deg, transparent 0%, rgba(170,170,180,0.01) 30%, rgba(170,170,180,0.04) 50%, rgba(170,170,180,0.01) 70%, transparent 100%)",
          transform: "translateY(-50%) rotate(2deg)",
          borderRadius: "50%"
        }}></div>
        
        {/* First large moon chunk - embedded in first ring */}
        <div className="absolute rounded-full bg-gray-300" style={{
          width: "15%",
          height: "15%",
          top: "42%",
          right: "-120%",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.6), 0 0 2px rgba(255,255,255,0.2)",
          transform: "rotate(15deg)"
        }}></div>
        
        {/* Second large moon chunk - embedded in second ring */}
        <div className="absolute rounded-full bg-gray-400" style={{
          width: "20%",
          height: "20%",
          bottom: "40%",
          left: "-110%",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.6), 0 0 2px rgba(255,255,255,0.2)",
          transform: "rotate(-20deg)"
        }}></div>
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
