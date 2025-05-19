import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "../../lib/stores/useAudio";
import { useGame } from "../../lib/stores/useGame";
import { useStory } from "../../lib/stores/useStory";
import { useAchievements } from "../../lib/stores/useAchievements";

interface EmergencyEncounterProps {
  onComplete: () => void;
}

const EmergencyEncounter = ({ onComplete }: EmergencyEncounterProps) => {
  const [phase, setPhase] = useState<"alarm" | "warp-drop" | "pirates" | "combat" | "complete">("alarm");
  const [showDialog, setShowDialog] = useState(true);
  const [dialogText, setDialogText] = useState("WARNING: Warp field disruption detected!");
  const [dialogDetails, setDialogDetails] = useState("");
  const [showAutopilotButton, setShowAutopilotButton] = useState(false);
  const [pirateInfo, setPirateInfo] = useState("");
  const { playAlarm, playExplosion } = useAudio();
  const { completeAchievement } = useAchievements();
  
  // Starfield elements for background
  const [stars, setStars] = useState<{x: number, y: number, size: number, opacity: number}[]>([]);
  
  // Generate stars for the background
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    setStars(newStars);
  }, []);
  
  useEffect(() => {
    // Play alarm sound when the encounter starts
    playAlarm();
    console.log("Emergency encounter started - playing alarm sound");
    
    // Show the autopilot button after a delay
    const timer = setTimeout(() => {
      setShowAutopilotButton(true);
      setDialogText("CRITICAL ALERT: Ship under attack!");
      setDialogDetails("Warp field collapsed. Multiple hostile vessels detected using stolen military tech!");
      playExplosion();
      console.log("Playing explosion sound effect");
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [playAlarm, playExplosion]);
  
  const handleDisableAutopilot = () => {
    setShowAutopilotButton(false);
    setPhase("warp-drop");
    setDialogText("Autopilot disengaged. Manual control activated!");
    setDialogDetails("Evasive maneuvers recommended! Ship systems registering multiple incoming projectiles.");
    
    // Play explosion sound for dramatic effect
    playExplosion();
    
    // Move to pirate encounter after a delay
    setTimeout(() => {
      setPhase("pirates");
      setDialogText("Pirates identified: 'The Void Reavers'");
      setDialogDetails("Known for attacking cargo ships and stealing advanced tech. Ship logs indicate they're after your cargo meant for Proxima Outpost!");
      setPirateInfo("Scanners detect 3 pirate vessels approaching with stolen military-grade weapons systems. Recommend immediate defensive action.");
      
      // Play explosion sound for dramatic effect
      playExplosion();
    }, 3000);
  };
  
  const handleEngageCombat = () => {
    setPhase("combat");
    setDialogText("Combat systems engaged!");
    setDialogDetails("Automatic defense countermeasures activated. Ship AI targeting hostile vessels.");
    
    // After a delay, complete the encounter
    setTimeout(() => {
      // Complete "Emergency Response" achievement
      const achievements = useAchievements.getState();
      const responseAchievement = achievements.achievements.find(a => a.name === "Emergency Response");
      if (responseAchievement) {
        completeAchievement(responseAchievement.id);
      }
      
      // Show victory message
      setDialogText("Pirates defeated!");
      setDialogDetails("The Void Reavers have retreated. Remember to deliver your cargo to Proxima Outpost!");
      
      // End the encounter after showing victory message
      setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 3000);
    }, 4000);
  };
  
  // Create explosion effect at random positions
  const renderExplosions = () => {
    if (phase !== "combat") return null;
    
    return Array.from({ length: 5 }).map((_, i) => (
      <motion.div 
        key={i}
        initial={{ 
          scale: 0,
          x: `${Math.random() * 80 + 10}%`, 
          y: `${Math.random() * 80 + 10}%`, 
          opacity: 1 
        }}
        animate={{ 
          scale: [0, 3, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 1,
          delay: Math.random() * 3,
          repeat: Infinity,
          repeatDelay: Math.random() * 5 + 2
        }}
        className="absolute w-4 h-4 rounded-full bg-orange-500 z-20"
        style={{
          boxShadow: "0 0 20px 10px rgba(255, 165, 0, 0.8)"
        }}
      />
    ));
  };
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 bg-black">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      {/* Red alert background effect */}
      <div 
        className={`absolute inset-0 bg-red-900 ${phase === "alarm" || phase === "warp-drop" ? "animate-pulse opacity-30" : "opacity-0"} transition-opacity duration-1000`} 
      />
      
      {/* Combat background effect - removed blue overlay */}
      
      {/* Explosion effects during combat */}
      {renderExplosions()}
      
      {/* Pirate ships with smooth entry and movement */}
      {phase === "pirates" || phase === "combat" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Lead pirate ship */}
          <motion.div 
            className="absolute w-16 h-7 bg-gray-700 rounded-lg"
            initial={{ 
              x: phase === "pirates" ? -500 : 0, 
              y: phase === "pirates" ? -100 : 0,
              rotate: 15
            }}
            animate={{ 
              x: phase === "combat" 
                ? [0, -50, 30, -20, 0] 
                : phase === "pirates" ? 0 : 0,
              y: phase === "combat" 
                ? [0, 30, -20, 10, 0] 
                : phase === "pirates" ? 0 : 0,
              rotate: phase === "pirates" ? [15, 5, 10, 5] : 5,
              scale: phase === "pirates" ? [0.5, 1] : 1
            }}
            transition={{ 
              duration: phase === "pirates" ? 3 : 4,
              ease: phase === "pirates" ? "easeOut" : "linear",
              repeat: phase === "combat" ? Infinity : 0
            }}
            style={{ left: '20%', top: '30%' }}
          >
            <div className="absolute w-10 h-4 bg-gray-800 rounded-t-lg" style={{ top: -4, left: 3 }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ bottom: '0', left: '5px' }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ bottom: '0', right: '5px' }}></div>
            
            {/* Engine glow */}
            <motion.div
              className="absolute h-3 rounded-full"
              style={{ 
                width: '8px',
                right: '-4px', 
                top: '2px',
                background: 'linear-gradient(to left, #ff4500, rgba(255, 69, 0, 0))'
              }}
              animate={{ width: [8, 15, 8], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Second pirate ship */}
          <motion.div 
            className="absolute w-18 h-8 bg-gray-800 rounded-lg"
            initial={{ 
              x: phase === "pirates" ? -700 : 0, 
              y: phase === "pirates" ? 50 : 0,
              rotate: -10
            }}
            animate={{ 
              x: phase === "combat" 
                ? [0, 40, -30, 20, 0] 
                : phase === "pirates" ? 0 : 0,
              y: phase === "combat" 
                ? [0, -20, 40, -10, 0] 
                : phase === "pirates" ? 0 : 0,
              rotate: phase === "pirates" ? [-10, -5, -8, -5] : -5,
              scale: phase === "pirates" ? [0.5, 1] : 1
            }}
            transition={{ 
              duration: phase === "pirates" ? 3.5 : 5,
              ease: phase === "pirates" ? "easeOut" : "linear",
              repeat: phase === "combat" ? Infinity : 0,
              delay: phase === "pirates" ? 0.3 : 0
            }}
            style={{ right: '25%', top: '40%' }}
          >
            <div className="absolute w-12 h-5 bg-gray-900 rounded-t-lg" style={{ top: -5, left: 3 }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ bottom: '0', right: '5px' }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ bottom: '0', left: '8px' }}></div>
            
            {/* Engine glow */}
            <motion.div
              className="absolute h-4 rounded-full"
              style={{ 
                width: '10px',
                right: '-5px', 
                top: '2px',
                background: 'linear-gradient(to left, #ff4500, rgba(255, 69, 0, 0))'
              }}
              animate={{ width: [10, 18, 10], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Third pirate ship */}
          <motion.div 
            className="absolute w-14 h-6 bg-gray-600 rounded-lg"
            initial={{ 
              x: phase === "pirates" ? -800 : 0, 
              y: phase === "pirates" ? 150 : 0,
              rotate: 8
            }}
            animate={{ 
              x: phase === "combat" 
                ? [0, -30, 20, -10, 0] 
                : phase === "pirates" ? 0 : 0,
              y: phase === "combat" 
                ? [0, 10, -30, 15, 0] 
                : phase === "pirates" ? 0 : 0,
              rotate: phase === "pirates" ? [8, 3, 5, 3] : 3,
              scale: phase === "pirates" ? [0.5, 1] : 1
            }}
            transition={{ 
              duration: phase === "pirates" ? 4 : 4.5,
              ease: phase === "pirates" ? "easeOut" : "linear",
              repeat: phase === "combat" ? Infinity : 0,
              delay: phase === "pirates" ? 0.6 : 0
            }}
            style={{ right: '35%', bottom: '30%' }}
          >
            <div className="absolute w-8 h-3 bg-gray-700 rounded-t-lg" style={{ top: -3, left: 3 }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ top: '0', left: '3px' }}></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ bottom: '0', right: '4px' }}></div>
            
            {/* Engine glow */}
            <motion.div
              className="absolute h-3 rounded-full"
              style={{ 
                width: '8px',
                right: '-4px', 
                top: '1.5px',
                background: 'linear-gradient(to left, #ff4500, rgba(255, 69, 0, 0))'
              }}
              animate={{ width: [8, 14, 8], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      ) : null}
      
      {/* Main encounter UI */}
      <AnimatePresence>
        <motion.div
          key={phase}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-gray-900 border-2 border-red-500 p-6 rounded-lg shadow-2xl max-w-2xl text-center z-30 relative"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">EMERGENCY ALERT</h2>
          
          <p className="text-white text-lg mb-2">{dialogText}</p>
          <p className="text-gray-300 text-sm mb-4">{dialogDetails}</p>
          
          {pirateInfo && (
            <div className="bg-gray-800 p-3 rounded mb-4 border border-gray-700">
              <p className="text-yellow-300 text-sm">{pirateInfo}</p>
            </div>
          )}
          
          {phase === "alarm" && showAutopilotButton && (
            <button
              onClick={handleDisableAutopilot}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md animate-pulse"
            >
              DISABLE AUTOPILOT
            </button>
          )}
          
          {phase === "pirates" && (
            <button
              onClick={handleEngageCombat}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md"
            >
              ENGAGE COMBAT SYSTEMS
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EmergencyEncounter;