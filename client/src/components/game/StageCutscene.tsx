import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useStory } from '@/lib/stores/useStory';
import { useGame } from '@/lib/stores/useGame';
import { useCharacter } from '@/lib/stores/useCharacter';
import { Faction } from '@/lib/types';

interface StageCutsceneProps {
  stageNumber: number;
  onComplete: () => void;
}

// Define the cutscene content for each stage transition
const cutsceneContent = {
  // End of Stage 1 - Beginning of Stage 2
  1: {
    title: "A New Journey Begins",
    text: "With your first mission complete, you've established yourself in this sector. Your actions have caught the attention of various factions, opening new opportunities and challenges. The frontier awaits your next move.",
    background: "bg-gradient-to-b from-indigo-900 to-black"
  },
  // End of Stage 2 - Beginning of Stage 3
  2: {
    title: "The Mystery Deepens",
    text: "Rumors of strange artifacts and unsettling disturbances have begun to spread throughout the sector. The Alliance and Syndicate are mobilizing their forces, while the Mystics speak of ancient prophecies coming to fruition.",
    background: "bg-gradient-to-b from-purple-900 to-black"
  },
  // End of Stage 3 - Beginning of Stage 4
  3: {
    title: "Into the Unknown",
    text: "The discovery of a mysterious signal leading to an uncharted region has set the sector abuzz. With tension between factions growing, you find yourself at the crossroads of a conflict that could reshape the future of space exploration.",
    background: "bg-gradient-to-b from-blue-900 to-black"
  },
  // End of Stage 4 - Beginning of Stage 5
  4: {
    title: "Rising Conflict",
    text: "Open hostilities have erupted between major factions. The artifacts you've encountered are becoming more active, and strange anomalies are appearing throughout the sector. Your reputation now precedes you, for better or worse.",
    background: "bg-gradient-to-b from-red-900 to-black"
  },
  // End of Stage 5
  5: {
    title: "The Calling",
    text: "Your journey has led you to a pivotal moment. The knowledge and allies you've gathered have prepared you for what lies ahead - a discovery that could change the course of humanity's future among the stars.",
    background: "bg-gradient-to-b from-amber-900 to-black"
  }
};

const StageCutscene: React.FC<StageCutsceneProps> = ({ stageNumber, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const { getFactionReputation } = useStory();
  const { character } = useCharacter();
  
  // Determine cutscene content based on stage
  const content = cutsceneContent[stageNumber] || {
    title: "The Journey Continues",
    text: "Your adventures continue as you venture deeper into the cosmos.",
    background: "bg-gradient-to-b from-gray-900 to-black"
  };
  
  // Show continue button after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle cutscene completion
  const handleComplete = () => {
    setVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500); // Short delay for animation
  };
  
  if (!visible) return null;
  
  // Format relationship details for display
  const getRelationshipStatus = (faction: Faction) => {
    const reputation = getFactionReputation(faction);
    
    if (reputation >= 50) return "Allied";
    if (reputation >= 25) return "Friendly";
    if (reputation >= 10) return "Respected";
    if (reputation >= 0) return "Neutral";
    if (reputation >= -10) return "Suspicious";
    if (reputation >= -25) return "Hostile";
    return "Enemy";
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${content.background}`}>
      {/* Starry background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 3}s`
            }}
          />
        ))}
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center px-6 py-8 rounded-lg bg-black bg-opacity-70 text-white"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{content.title}</h1>
          
          <div className="space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">{content.text}</p>
            
            {/* Character and faction status summary */}
            <div className="mt-8 bg-gray-900 bg-opacity-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Status Report</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <h3 className="font-medium text-blue-300">Character</h3>
                  <p>Name: {character.name}</p>
                  <p>Class: {character.class}</p>
                  <p>Level: {character.level}</p>
                </div>
                
                <div className="text-left">
                  <h3 className="font-medium text-blue-300">Faction Relations</h3>
                  <p>Alliance: {getRelationshipStatus(Faction.Alliance)}</p>
                  <p>Syndicate: {getRelationshipStatus(Faction.Syndicate)}</p>
                  <p>Settlers: {getRelationshipStatus(Faction.Settlers)}</p>
                  <p>Mystics: {getRelationshipStatus(Faction.Mystics)}</p>
                </div>
              </div>
            </div>
            
            {showContinue && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <Button
                  onClick={handleComplete}
                  className="px-8 py-3 text-lg"
                >
                  Continue Journey
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StageCutscene;