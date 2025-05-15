import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStarQuest from '@/lib/stores/useStarQuest';
import { MissionTemplate } from '@/lib/data/mission-pool';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface StoryQuestProps {
  questId?: string;
  onClose?: () => void;
  onComplete?: () => void;
}

const StoryQuest: React.FC<StoryQuestProps> = ({ 
  questId,
  onClose, 
  onComplete 
}) => {
  const { 
    getCurrentMission, 
    startMission, 
    completeMission, 
    getMissionById,
    hasFlag
  } = useStarQuest();
  
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [currentMission, setCurrentMission] = useState<MissionTemplate | null>(null);
  
  // Initialize the mission
  useEffect(() => {
    // If a specific questId is provided, use that
    if (questId) {
      const mission = getMissionById(questId);
      if (mission) {
        setCurrentMission(mission);
        return;
      }
    }
    
    // Otherwise use the current active mission
    const activeMission = getCurrentMission();
    setCurrentMission(activeMission);
    
    // If no mission is active or provided, start the first mission
    if (!activeMission && !questId) {
      // Default to first mission
      startMission('distress_signal');
      const firstMission = getCurrentMission();
      setCurrentMission(firstMission);
    }
  }, [questId, getCurrentMission, getMissionById, startMission]);
  
  // No mission available
  if (!currentMission) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <Card className="w-full max-w-2xl bg-gray-900 text-white">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">No Mission Available</h2>
            <p>There are no active missions at this time. Check back later or speak with contacts at various locations.</p>
            <div className="mt-4 flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Handle making a choice
  const handleChoice = (choice: { id: string, outcome: string }) => {
    setChoiceId(choice.id);
    setOutcomeId(choice.outcome);
    setShowOutcome(true);
  };
  
  // Handle completing the mission
  const handleComplete = () => {
    if (choiceId && outcomeId) {
      completeMission(choiceId, outcomeId);
      
      if (onComplete) {
        onComplete();
      } else if (onClose) {
        onClose();
      }
    }
  };
  
  // Get the outcome text if a choice has been made
  const getOutcomeText = () => {
    if (!outcomeId || !currentMission) return null;
    
    const outcome = currentMission.outcomes.find(o => o.id === outcomeId);
    return outcome?.text || null;
  };
  
  // Check if a choice has requirements and if they're met
  const canChoose = (choice: { id: string; text: string; requiredFlags?: string[]; outcome: string }) => {
    // Check for required flags
    if (choice.requiredFlags && choice.requiredFlags.length > 0) {
      if (!choice.requiredFlags.every((flag: string) => hasFlag(flag))) {
        return false;
      }
    }
    
    // We'll add more checks later (items, faction reputation, etc.)
    return true;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={showOutcome ? 'outcome' : 'mission'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-gray-900 text-white overflow-hidden">
            <div className="p-6">
              {!showOutcome ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">{currentMission.title}</h2>
                  <p className="text-gray-300 mb-6">{currentMission.description}</p>
                  
                  <h3 className="text-lg font-semibold mb-3">Options:</h3>
                  <div className="space-y-3">
                    {currentMission.choices.map(choice => (
                      <Button
                        key={choice.id}
                        onClick={() => handleChoice(choice)}
                        className="w-full justify-start text-left p-4 h-auto"
                        disabled={!canChoose(choice)}
                        variant={canChoose(choice) ? "default" : "outline"}
                      >
                        {choice.text}
                        {!canChoose(choice) && (
                          <span className="ml-2 text-red-400 text-sm">(Requirements not met)</span>
                        )}
                      </Button>
                    ))}
                  </div>
                  
                  {onClose && (
                    <div className="mt-6 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Outcome</h2>
                  <div className="bg-gray-800 p-4 rounded-md mb-6">
                    <p className="text-gray-200">{getOutcomeText()}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleComplete}>Continue</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StoryQuest;