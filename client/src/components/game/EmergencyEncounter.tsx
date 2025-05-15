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
  const [showAutopilotButton, setShowAutopilotButton] = useState(false);
  const { playAlarm, playExplosion } = useAudio();
  const { completeAchievement } = useAchievements();
  
  useEffect(() => {
    // Play alarm sound when the encounter starts
    playAlarm();
    
    // Show the autopilot button after a delay
    const timer = setTimeout(() => {
      setShowAutopilotButton(true);
      setDialogText("CRITICAL ALERT: Ship under attack! Warp field collapsed. Hostile ships detected!");
      playExplosion();
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [playAlarm, playExplosion]);
  
  const handleDisableAutopilot = () => {
    setShowAutopilotButton(false);
    setPhase("warp-drop");
    setDialogText("Autopilot disengaged. Manual controls active. Evasive maneuvers recommended!");
    
    // Move to pirate encounter after a delay
    setTimeout(() => {
      setPhase("pirates");
      setDialogText("WARNING: Pirate vessels detected. Weapons systems online. Defend the ship!");
      
      // Play explosion sound for dramatic effect
      playExplosion();
    }, 2000);
  };
  
  const handleEngageCombat = () => {
    setPhase("combat");
    setShowDialog(false);
    
    // After a delay, complete the encounter
    setTimeout(() => {
      // Complete "Emergency Response" achievement
      const achievements = useAchievements.getState();
      const responseAchievement = achievements.achievements.find(a => a.name === "Emergency Response");
      if (responseAchievement) {
        completeAchievement(responseAchievement.id);
      }
      
      // End the encounter
      setPhase("complete");
      onComplete();
    }, 1500);
  };
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Red alert background effect */}
      <div 
        className={`absolute inset-0 bg-red-900 ${phase === "alarm" ? "animate-pulse opacity-30" : "opacity-0"} transition-opacity duration-1000`} 
      />
      
      {/* Main encounter UI */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-gray-900 border-2 border-red-500 p-6 rounded-lg shadow-2xl max-w-2xl text-center z-10"
          >
            <h2 className="text-2xl font-bold text-red-500 mb-4">EMERGENCY ALERT</h2>
            
            <p className="text-white text-lg mb-6">{dialogText}</p>
            
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyEncounter;