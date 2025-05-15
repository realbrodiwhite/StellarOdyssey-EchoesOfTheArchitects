import React, { useState, useEffect } from 'react';
import { useStarQuest } from '@/lib/stores/useStarQuest';
import { useStory } from '@/lib/stores/useStory';
import { useGame } from '@/lib/stores/useGame';
import StoryQuest from './StoryQuest';
import { QuestState } from '@/lib/data/star-quest';

interface StarQuestManagerProps {
  onQuestComplete?: () => void;
}

const StarQuestManager: React.FC<StarQuestManagerProps> = ({ onQuestComplete }) => {
  const { getCurrentLocation } = useStory();
  const { 
    getQuestsByState, 
    getCurrentStage, 
    getQuest,
    activeQuests,
    initializeStarQuest
  } = useStarQuest();
  const { state: gameState } = useGame();
  
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [showQuest, setShowQuest] = useState(false);
  
  // Initialize Star Quest system
  useEffect(() => {
    initializeStarQuest();
  }, [initializeStarQuest]);
  
  // Check for quests to display based on current location
  useEffect(() => {
    if (gameState !== 'game') return;
    
    const currentLocation = getCurrentLocation();
    if (!currentLocation) return;
    
    // Only proceed if not already showing a quest
    if (showQuest) return;
    
    // Get in-progress quests
    const inProgressQuests = getQuestsByState(QuestState.InProgress);
    
    // Find a quest with a current stage matching this location
    const locationQuest = inProgressQuests.find(quest => {
      const currentStage = getCurrentStage(quest.id);
      return currentStage && currentStage.location === currentLocation.id;
    });
    
    if (locationQuest) {
      console.log(`Found quest "${locationQuest.title}" for location ${currentLocation.id}`);
      setActiveQuestId(locationQuest.id);
      setShowQuest(true);
    }
  }, [getCurrentLocation, getQuestsByState, getCurrentStage, gameState, showQuest]);
  
  const handleQuestComplete = () => {
    setShowQuest(false);
    
    // Optional callback
    if (onQuestComplete) {
      onQuestComplete();
    }
    
    // Reset active quest after a delay
    setTimeout(() => {
      setActiveQuestId(null);
    }, 500);
  };
  
  // No quest to show
  if (!showQuest || !activeQuestId) {
    return null;
  }
  
  const quest = getQuest(activeQuestId);
  
  return (
    <>
      {showQuest && activeQuestId && quest && (
        <StoryQuest
          questId={activeQuestId}
          onComplete={handleQuestComplete}
        />
      )}
    </>
  );
};

export default StarQuestManager;