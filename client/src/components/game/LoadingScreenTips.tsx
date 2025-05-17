import React, { useState, useEffect, useRef } from 'react';
import { useCharacter } from '@/lib/stores/useCharacter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/lib/stores/useAudio';
import { CharacterClass } from '@/lib/types';

interface LoadingScreenTipsProps {
  context?: 'combat' | 'exploration' | 'puzzle' | 'story' | 'general';
  onComplete?: () => void;
  minDisplayTime?: number;
}

// Define the structure for our tips
interface Tip {
  text: string;
  context: string[];
  voiceover?: string; // Path to audio file
  characterClasses?: CharacterClass[]; // Which classes this tip is most relevant for
}

const LoadingScreenTips: React.FC<LoadingScreenTipsProps> = ({ 
  context = 'general',
  onComplete,
  minDisplayTime = 3000
}) => {
  const { character } = useCharacter();
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tipAudio, setTipAudio] = useState<HTMLAudioElement | null>(null);
  const tipDisplayStartTime = useRef<number>(0);
  
  // Collection of tips grouped by context
  const tips: Tip[] = [
    // General tips
    {
      text: "The Architects' technology responds differently to each character class. Engineers can interface with it more efficiently.",
      context: ['general', 'exploration'],
      characterClasses: [CharacterClass.Engineer]
    },
    {
      text: "Scientists can analyze alien artifacts and gain additional insights about their purpose and history.",
      context: ['general', 'exploration', 'puzzle'],
      characterClasses: [CharacterClass.Scientist]
    },
    {
      text: "Diplomats can negotiate better terms with alien factions and may avoid certain combat encounters entirely.",
      context: ['general', 'exploration'],
      characterClasses: [CharacterClass.Diplomat]
    },
    {
      text: "Pilots maneuver more efficiently in space, making them ideal for exploration missions.",
      context: ['general', 'exploration'],
      characterClasses: [CharacterClass.Pilot]
    },
    {
      text: "Soldiers excel in combat situations, gaining bonuses to damage and defense.",
      context: ['general', 'combat'],
      characterClasses: [CharacterClass.Soldier]
    },
    {
      text: "Mercenaries can access unique upgrade paths for weapons and armor.",
      context: ['general', 'combat'],
      characterClasses: [CharacterClass.Mercenary]
    },
    {
      text: "Explorers can find hidden locations and uncover secret paths through challenging terrain.",
      context: ['general', 'exploration'],
      characterClasses: [CharacterClass.Explorer]
    },
    
    // Combat tips
    {
      text: "Energy weapons are effective against shields, while kinetic weapons deal more damage to armor.",
      context: ['combat']
    },
    {
      text: "Some enemies have weaknesses to specific damage types. Experiment to find the most effective approach.",
      context: ['combat']
    },
    {
      text: "Party formation matters in combat. Placing tanks in front can protect more vulnerable allies.",
      context: ['combat']
    },
    
    // Exploration tips
    {
      text: "Scan planets thoroughly before landing. Some hazards aren't visible from orbit.",
      context: ['exploration']
    },
    {
      text: "Derelict ships often contain valuable technology, but may also harbor automated defense systems.",
      context: ['exploration']
    },
    {
      text: "The Void Entities become more active in regions with high concentrations of Architect artifacts.",
      context: ['exploration', 'story']
    },
    
    // Puzzle tips
    {
      text: "Many Architect puzzles have multiple solutions, each yielding different rewards.",
      context: ['puzzle']
    },
    {
      text: "Technical skills help with mechanical puzzles, while scientific knowledge aids with research-based challenges.",
      context: ['puzzle']
    },
    {
      text: "If you're stuck on a puzzle, consider using a different character's skills or approaching it from a new angle.",
      context: ['puzzle']
    },
    
    // Story tips
    {
      text: "Your reputation with factions affects how they respond to you in future encounters.",
      context: ['story', 'general']
    },
    {
      text: "The mysteries of the Architects are tied to the sudden appearance of the anomalies throughout the galaxy.",
      context: ['story']
    },
    {
      text: "Each faction has their own theory about the Architects. Listen carefully to piece together the truth.",
      context: ['story']
    }
  ];

  useEffect(() => {
    // Select tips relevant to the current context and character class
    const relevantTips = tips.filter(tip => 
      tip.context.includes(context) && 
      (!tip.characterClasses || 
       !character?.class || 
       tip.characterClasses.includes(character.class))
    );
    
    if (relevantTips.length > 0) {
      // Choose a random tip from the relevant ones
      const randomTip = relevantTips[Math.floor(Math.random() * relevantTips.length)];
      setCurrentTip(randomTip);
      
      // If this tip has voiceover, load it
      if (randomTip.voiceover) {
        const audio = new Audio(randomTip.voiceover);
        setTipAudio(audio);
        audio.play().catch(error => {
          console.log("Tip voiceover autoplay prevented:", error);
        });
      }
    }
    
    // Start the progress animation
    const startTime = Date.now();
    tipDisplayStartTime.current = startTime;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(100, (elapsed / minDisplayTime) * 100);
      setProgress(progressValue);
      
      if (elapsed >= minDisplayTime) {
        clearInterval(progressInterval);
        setIsLoading(false);
        
        // Wait a bit after loading completes before calling onComplete
        setTimeout(() => {
          if (tipAudio) {
            tipAudio.pause();
            tipAudio.currentTime = 0;
          }
          onComplete && onComplete();
        }, 1000);
      }
    }, 50);
    
    return () => {
      clearInterval(progressInterval);
      if (tipAudio) {
        tipAudio.pause();
        tipAudio.currentTime = 0;
      }
    };
  }, [context, character, minDisplayTime, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
        >
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-2">
                {context.charAt(0).toUpperCase() + context.slice(1)} Tip
              </h2>
              
              {currentTip && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <p className="text-xl text-white bg-gray-900 bg-opacity-60 p-6 rounded-lg shadow-xl">
                    {currentTip.text}
                  </p>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Loading...</span>
              <span className="text-gray-400 text-sm">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>

            {/* Character avatar and name if we have character info */}
            {character && (
              <div className="mt-8 flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                  {/* Icon/avatar for character class */}
                  <span className="text-2xl">{getCharacterIcon(character.class)}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{character.name}</div>
                  <div className="text-blue-300 text-sm">{character.class}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to get an icon for each character class
const getCharacterIcon = (characterClass?: CharacterClass): string => {
  switch (characterClass) {
    case CharacterClass.Engineer:
      return '🔧';
    case CharacterClass.Scientist:
      return '🔬';
    case CharacterClass.Diplomat:
      return '🎭';
    case CharacterClass.Pilot:
      return '🚀';
    case CharacterClass.Soldier:
      return '🔫';
    case CharacterClass.Mercenary:
      return '💰';
    case CharacterClass.Explorer:
      return '🧭';
    case CharacterClass.Hacker:
      return '💻';
    case CharacterClass.Medic:
      return '⚕️';
    case CharacterClass.Trader:
      return '📊';
    case CharacterClass.Captain:
      return '⚓';
    case CharacterClass.Smuggler:
      return '📦';
    default:
      return '👤';
  }
};

export default LoadingScreenTips;