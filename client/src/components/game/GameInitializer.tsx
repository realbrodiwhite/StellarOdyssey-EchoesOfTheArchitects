import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import StoryQuest from './StoryQuest';
import useStarQuest from '@/lib/stores/useStarQuest';
import { useCharacter } from '@/lib/stores/useCharacter';
import { useStory } from '@/lib/stores/useStory';
import { CharacterClass, Faction } from '@/lib/types';
import { motion } from 'framer-motion';

interface GameInitializerProps {
  onStartGame: () => void;
}

const GameInitializer: React.FC<GameInitializerProps> = ({ onStartGame }) => {
  const [step, setStep] = useState<'intro' | 'quest' | 'complete'>('intro');
  const { startMission, resetProgress } = useStarQuest();
  const { character, initializeCharacter } = useCharacter();
  const { changeFactionReputation } = useStory();
  
  // Reset progress when component mounts (for demo purposes)
  useEffect(() => {
    resetProgress();
    
    // Initialize character if needed
    if (!character.name) {
      initializeCharacter({
        name: 'Commander',
        class: CharacterClass.Pilot,
        skills: []
      });
    }
    
    // Initialize neutral faction standings
    Object.values(Faction).forEach(faction => {
      if (faction !== Faction.VoidEntity) {
        changeFactionReputation(faction, 0);
      } else {
        // Start slightly suspicious of void entities
        changeFactionReputation(faction, -10);
      }
    });
  }, [resetProgress, character, initializeCharacter, changeFactionReputation]);
  
  const handleStartFirstMission = () => {
    startMission('distress_signal');
    setStep('quest');
  };
  
  const handleQuestComplete = () => {
    setStep('complete');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {step === 'intro' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-gray-900 text-white overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Star Quest: Cosmic Odyssey</h2>
              
              <div className="space-y-4 mb-6">
                <p>
                  Welcome to the Star Quest mission system! Your journey across the galaxy will present you with countless choices that will shape your destiny and the fate of those around you.
                </p>
                <p>
                  With 5 possible missions at each of the 20 stages of your journey, there are over 95 trillion possible adventure combinations, making your playthrough completely unique.
                </p>
                <p>
                  Each decision you make will affect your relationships with the galaxy's major factions, open or close story paths, and determine the ultimate outcome of your cosmic odyssey.
                </p>
              </div>
              
              <div className="space-y-2 px-6 py-4 bg-gray-800 rounded-md mb-6">
                <h3 className="font-semibold text-blue-300">Pilot's Note:</h3>
                <p className="text-sm">
                  Ship's log, stardate 2735.6: After months in deep space, we're approaching the Proxima system. Long-range scanners are picking up unusual activity. I should prepare for the unexpected...
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleStartFirstMission}
                  className="px-8 py-2"
                  size="lg"
                >
                  Begin Your Journey
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {step === 'quest' && (
        <StoryQuest onComplete={handleQuestComplete} />
      )}
      
      {step === 'complete' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-gray-900 text-white overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Your Journey Begins</h2>
              
              <p className="mb-6">
                You've completed your first Star Quest mission! Your choices have already begun to shape your path through the cosmos. Continue your adventure by exploring space, visiting new locations, and making critical decisions that will determine your legacy.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  onClick={onStartGame}
                  className="px-8 py-2"
                  size="lg"
                >
                  Enter The Cosmos
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GameInitializer;