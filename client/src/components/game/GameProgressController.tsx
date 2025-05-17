import React, { useState, useEffect } from 'react';
import { useGameProgress, GameStage } from '../../lib/stores/useGameProgress';
import TextCrawl from './TextCrawl';
import ActCutscene from './ActCutscene';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProgressControllerProps {
  onComplete: () => void;
}

const GameProgressController: React.FC<GameProgressControllerProps> = ({ onComplete }) => {
  const { 
    currentStage, 
    advanceStage, 
    getCurrentActNumber
  } = useGameProgress();
  
  const [showComponent, setShowComponent] = useState(true);
  
  const handleComponentComplete = () => {
    setShowComponent(false);
    
    // Short delay to allow exit animation
    setTimeout(() => {
      advanceStage();
      setShowComponent(true);
      
      // If we've reached the complete state, notify parent
      if (currentStage === GameStage.Complete) {
        onComplete();
      }
    }, 500);
  };
  
  // Render the appropriate component based on current flow state
  const renderFlowComponent = () => {
    if (!showComponent) return null;
    
    switch (currentStage) {
      case GameStage.Intro:
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
        
      case GameStage.Cutscene1:
      case GameStage.Cutscene2:
      case GameStage.Cutscene3:
      case GameStage.Cutscene4:
      case GameStage.Cutscene5:
        // Extract the act number from the state string (e.g., "cutscene1" => 1)
        const actNumber = parseInt(currentStage.replace('cutscene', ''));
        return (
          <ActCutscene
            actNumber={actNumber}
            onComplete={handleComponentComplete}
          />
        );
        
      case GameStage.Outro:
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
      case GameStage.Act1:
      case GameStage.Act2:
      case GameStage.Act3:
      case GameStage.Act4:
      case GameStage.Act5:
      case GameStage.Complete:
        return null;
        
      default:
        return null;
    }
  };
  
  // Only render if we're in a state that needs this controller
  if ([
    GameStage.Act1, 
    GameStage.Act2, 
    GameStage.Act3, 
    GameStage.Act4, 
    GameStage.Act5,
    GameStage.Complete
  ].includes(currentStage)) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStage}
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

export default GameProgressController;