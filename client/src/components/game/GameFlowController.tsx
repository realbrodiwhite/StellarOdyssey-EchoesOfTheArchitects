import React, { useState, useEffect } from 'react';
import { useGameFlow, GameFlowState } from '../../lib/stores/useGameFlow';
import { useStarQuest } from '../../lib/stores/useStarQuest';
import TextCrawl from './TextCrawl';
import ActCutscene from './ActCutscene';
import { motion, AnimatePresence } from 'framer-motion';

interface GameFlowControllerProps {
  onComplete: () => void;
}

const GameFlowController: React.FC<GameFlowControllerProps> = ({ onComplete }) => {
  const { 
    currentFlowState, 
    advanceFlow,
    currentAct
  } = useGameFlow();
  
  const [showComponent, setShowComponent] = useState(true);
  
  const handleComponentComplete = () => {
    setShowComponent(false);
    
    // Short delay to allow exit animation
    setTimeout(() => {
      advanceFlow();
      setShowComponent(true);
      
      // If we've reached the complete state, notify parent
      if (currentFlowState === GameFlowState.Complete) {
        onComplete();
      }
    }, 500);
  };
  
  // Render the appropriate component based on current flow state
  const renderFlowComponent = () => {
    if (!showComponent) return null;
    
    switch (currentFlowState) {
      case GameFlowState.Intro:
        return (
          <TextCrawl
            title="Stellar Odyssey: Echoes of the Architects"
            text={[
              "In the year 2387, humanity has expanded across the stars, establishing colonies and outposts throughout the galaxy.",
              "Recent discoveries of mysterious artifacts have sparked theories about an ancient civilization that once spanned multiple star systems.",
              "As tensions grow between the major factions - the Alliance, the Syndicate, the Settlers Coalition, and the enigmatic Order of the Cosmic Veil - the artifacts become the center of a complex web of intrigue and power struggles.",
              "You, a skilled pilot with a versatile ship and a sharp mind, find yourself drawn into this galactic mystery that could reshape the future of human civilization.",
              "Your journey begins now, as you chart your own path among the stars..."
            ]}
            onComplete={handleComponentComplete}
          />
        );
        
      case GameFlowState.Cutscene1:
      case GameFlowState.Cutscene2:
      case GameFlowState.Cutscene3:
      case GameFlowState.Cutscene4:
      case GameFlowState.Cutscene5:
        // Extract the act number from the state string (e.g., "cutscene1" => 1)
        const actNumber = parseInt(currentFlowState.replace('cutscene', ''));
        return (
          <ActCutscene
            actNumber={actNumber}
            onComplete={handleComponentComplete}
          />
        );
        
      case GameFlowState.Outro:
        return (
          <TextCrawl
            title="Epilogue: A New Beginning"
            text={[
              "As the final pieces of the ancient puzzle fall into place, the true purpose of the artifacts is revealed.",
              "The knowledge of the Architects - a civilization that thrived millions of years ago - offers humanity a glimpse into possibilities beyond imagination.",
              "Your decisions throughout this journey have shaped not only your own destiny but the future path of human civilization among the stars.",
              "Though many mysteries remain, you have earned your place in the annals of history as one who helped bridge the gap between humanity's present and the legacy of those who came before.",
              "This is not an end, but a beginning. The stars await your next adventure..."
            ]}
            onComplete={handleComponentComplete}
          />
        );
        
      // Act states are handled by the game itself, not this controller
      case GameFlowState.Act1:
      case GameFlowState.Act2:
      case GameFlowState.Act3:
      case GameFlowState.Act4:
      case GameFlowState.Act5:
      case GameFlowState.Complete:
        return null;
        
      default:
        return null;
    }
  };
  
  // Only render if we're in a state that needs this controller
  if ([
    GameFlowState.Act1, 
    GameFlowState.Act2, 
    GameFlowState.Act3, 
    GameFlowState.Act4, 
    GameFlowState.Act5,
    GameFlowState.Complete
  ].includes(currentFlowState)) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentFlowState}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderFlowComponent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default GameFlowController;