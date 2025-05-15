import React, { useState, useEffect } from 'react';
import MultiPathPuzzle from './MultiPathPuzzle';

interface PuzzleProps {
  onPuzzleSolved: () => void;
}

/**
 * The Puzzle component is now a wrapper that renders the new MultiPathPuzzle component
 * with enhanced functionality for multiple solution paths.
 */
const Puzzle: React.FC<PuzzleProps> = ({ onPuzzleSolved }) => {
  // For demo purposes, we'll start with a predefined puzzle ID
  const [activePuzzleId, setActivePuzzleId] = useState<string>('ship_power_failure');
  
  // Handle completion
  const handlePuzzleComplete = (success: boolean) => {
    if (success) {
      console.log('Puzzle completed successfully!');
    } else {
      console.log('Puzzle failed.');
    }
    
    // After a short delay, notify parent component
    setTimeout(() => {
      onPuzzleSolved();
    }, 1000);
  };
  
  return (
    <MultiPathPuzzle 
      puzzleId={activePuzzleId}
      onComplete={handlePuzzleComplete}
      onClose={onPuzzleSolved}
    />
  );
};

export default Puzzle;
