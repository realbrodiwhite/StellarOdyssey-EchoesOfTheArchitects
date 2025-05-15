import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStarQuest } from '@/lib/stores/useStarQuest';
import { useCharacter } from '@/lib/stores/useCharacter';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { StoryChoice, Quest, StoryStage } from '@/lib/data/star-quest';

interface StoryQuestProps {
  questId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

const StoryQuest: React.FC<StoryQuestProps> = ({ questId, onClose, onComplete }) => {
  const { getQuest, getCurrentStage, getAvailableChoices, canChooseOption, makeChoice } = useStarQuest();
  const { selectedCharacter } = useCharacter();
  const audioState = useAudio();
  
  const [quest, setQuest] = useState<Quest | undefined>(undefined);
  const [currentStage, setCurrentStage] = useState<StoryStage | undefined>(undefined);
  const [availableChoices, setAvailableChoices] = useState<StoryChoice[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  
  // Load quest data
  useEffect(() => {
    const currentQuest = getQuest(questId);
    if (currentQuest) {
      setQuest(currentQuest);
      
      // Get the current stage
      const stage = getCurrentStage(questId);
      setCurrentStage(stage);
      
      // Get available choices
      setAvailableChoices(getAvailableChoices(questId));
    }
  }, [questId, getQuest, getCurrentStage, getAvailableChoices]);
  
  // Animate text appearance
  useEffect(() => {
    if (currentStage) {
      setShowAnimation(true);
      
      // After text animation, show choices
      const timer = setTimeout(() => {
        setShowChoices(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStage]);
  
  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
  };
  
  const handleChoiceConfirm = () => {
    if (!selectedChoiceId) return;
    
    // Play a success sound if available
    if (useAudio.getState().successSound) {
      useAudio.getState().playSuccess();
    }
    
    const success = makeChoice(questId, selectedChoiceId);
    if (success) {
      // Reset animation states
      setShowAnimation(false);
      setShowChoices(false);
      
      // Update the stage and choices
      setTimeout(() => {
        const updatedStage = getCurrentStage(questId);
        
        // If we still have a stage, update it
        if (updatedStage) {
          setCurrentStage(updatedStage);
          setAvailableChoices(getAvailableChoices(questId));
          setSelectedChoiceId(null);
        } else {
          // No more stages, quest must be complete
          if (onComplete) {
            onComplete();
          }
        }
      }, 500);
    }
  };
  
  if (!quest || !currentStage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <Card className="w-full max-w-xl p-6 bg-gray-900 text-white">
          <h2 className="text-2xl font-bold text-center mb-4">Loading Quest...</h2>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
      <Card className="w-full max-w-xl bg-gray-900 shadow-lg overflow-hidden">
        <div className="bg-blue-900 p-4">
          <h2 className="text-2xl font-bold text-white">{quest.title}</h2>
          <p className="text-blue-200 text-sm">{currentStage.title}</p>
        </div>
        
        <div className="p-6 bg-gray-800 min-h-[200px]">
          <AnimatePresence mode="wait">
            {showAnimation && (
              <motion.div
                className="text-gray-200 text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentStage.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {showChoices && (
            <motion.div
              className="p-4 bg-gray-900 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-lg font-medium text-blue-300 mb-2">Your Decision:</h3>
              
              <div className="space-y-2">
                {availableChoices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`p-3 border rounded-md cursor-pointer transition-all ${
                      selectedChoiceId === choice.id
                        ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                        : 'border-gray-700 hover:border-blue-400 bg-gray-800'
                    }`}
                    onClick={() => handleChoiceSelect(choice.id)}
                  >
                    <p className="text-gray-200">{choice.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  disabled={!selectedChoiceId}
                  onClick={handleChoiceConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                >
                  Confirm Decision
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default StoryQuest;