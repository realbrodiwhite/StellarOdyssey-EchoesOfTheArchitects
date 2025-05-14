import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAchievements } from '@/lib/stores/useAchievements';
import AchievementUnlock from './AchievementUnlock';
import { AlertTriangle, Check, HelpCircle, Zap } from 'lucide-react';

interface TechnicalPuzzleProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const TechnicalPuzzle: React.FC<TechnicalPuzzleProps> = ({ onClose, onSuccess }) => {
  // Circuit configuration puzzle
  // Players need to connect power nodes in the correct sequence to unlock ship's AI system
  
  const [nodes, setNodes] = useState<Array<{id: number, active: boolean, correct: boolean}>>([
    { id: 1, active: false, correct: false },
    { id: 2, active: false, correct: false },
    { id: 3, active: false, correct: false },
    { id: 4, active: false, correct: false },
    { id: 5, active: false, correct: false },
    { id: 6, active: false, correct: false },
    { id: 7, active: false, correct: false },
    { id: 8, active: false, correct: false },
    { id: 9, active: false, correct: false },
  ]);
  
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  
  // The correct sequence solution
  const correctSequence = [4, 2, 8, 6, 1, 9]; // this is the winning pattern
  
  const { completeAchievement, achievements } = useAchievements();
  const techGeniusAchievement = achievements.find(a => a.name === "Technical Genius");
  
  // Effect to check if the sequence is correct after each node activation
  useEffect(() => {
    // Reset error message when sequence changes
    setError('');
    
    // Check sequence so far
    const sequenceCorrectSoFar = currentSequence.every(
      (nodeId, index) => correctSequence[index] === nodeId
    );
    
    // If sequence isn't right so far, show error
    if (currentSequence.length > 0 && !sequenceCorrectSoFar) {
      setError('Invalid sequence detected. Power flow disrupted.');
      
      // Reset sequence after a short delay
      setTimeout(() => {
        resetSequence();
        setAttemptCount(prev => prev + 1);
      }, 1500);
      return;
    }
    
    // Check if puzzle is solved
    if (currentSequence.length === correctSequence.length && sequenceCorrectSoFar) {
      handlePuzzleSolved();
    }
  }, [currentSequence]);
  
  // Reset the current sequence
  const resetSequence = () => {
    setCurrentSequence([]);
    setNodes(nodes.map(node => ({ ...node, active: false, correct: false })));
  };
  
  // Handle clicking on a node
  const handleNodeClick = (nodeId: number) => {
    if (puzzleSolved) return;
    
    // Activate the node and add to sequence
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, active: true } 
        : node
    ));
    
    setCurrentSequence(prev => [...prev, nodeId]);
  };
  
  // Handle when the puzzle is solved
  const handlePuzzleSolved = () => {
    setPuzzleSolved(true);
    
    // Light up all nodes in the correct sequence
    setNodes(nodes.map(node => ({
      ...node,
      active: correctSequence.includes(node.id),
      correct: correctSequence.includes(node.id)
    })));
    
    // Complete the achievement
    if (techGeniusAchievement && !techGeniusAchievement.completed) {
      completeAchievement(techGeniusAchievement.id);
      setShowAchievement(true);
    }
    
    // Call success callback after a delay
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border-2 border-blue-600 rounded-lg p-5 max-w-2xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">
            <Zap className="inline mr-2" /> 
            Ship AI Neural Circuit Reactivation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        
        {puzzleSolved ? (
          <div className="text-center py-8">
            <div className="inline-block p-4 bg-green-900 bg-opacity-30 rounded-full mb-4">
              <Check size={48} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Circuit Successfully Reconfigured</h3>
            <p className="text-gray-300 mb-6">
              Ship's AI neural pathways successfully reactivated. Companion AI system is now online and available on your forearm terminal.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full border border-yellow-500 mr-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                </div>
                <div className="flex-1 text-gray-300 text-sm">
                  The ship's AI companion system needs reactivation. Connect the neural power nodes in the correct sequence to re-enable the system.
                </div>
              </div>
              
              {error && (
                <div className="p-3 mb-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {attemptCount > 2 && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300 mb-4"
                >
                  <HelpCircle size={14} className="mr-1" /> Show help
                </button>
              )}
              
              {showHint && (
                <div className="p-3 mb-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-md text-blue-300 text-sm">
                  <strong>Hint:</strong> The circuit requires a power flow from the center outward, following the ship's radial power distribution pattern.
                </div>
              )}
            </div>
            
            {/* Circuit board grid */}
            <div className="grid grid-cols-3 gap-4 mb-6 relative">
              {/* Power line overlay (simulates connections between nodes) */}
              {currentSequence.length > 0 && (
                <div className="absolute inset-0 z-0">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {currentSequence.map((nodeId, index) => {
                      if (index === 0) return null;
                      
                      const previousNodeId = currentSequence[index - 1];
                      const previousNodeIndex = nodes.findIndex(n => n.id === previousNodeId);
                      const currentNodeIndex = nodes.findIndex(n => n.id === nodeId);
                      
                      // Calculate positions (this is simplified)
                      const previousRow = Math.floor(previousNodeIndex / 3);
                      const previousCol = previousNodeIndex % 3;
                      const currentRow = Math.floor(currentNodeIndex / 3);
                      const currentCol = currentNodeIndex % 3;
                      
                      // Calculate center points
                      const x1 = previousCol * 33.33 + 16.67;
                      const y1 = previousRow * 33.33 + 16.67;
                      const x2 = currentCol * 33.33 + 16.67;
                      const y2 = currentRow * 33.33 + 16.67;
                      
                      return (
                        <line
                          key={`line-${index}`}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke={error ? "#ef4444" : "#3b82f6"}
                          strokeWidth="2"
                          strokeDasharray={error ? "5,5" : "none"}
                        />
                      );
                    })}
                  </svg>
                </div>
              )}
              
              {/* Circuit nodes */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => !node.active && handleNodeClick(node.id)}
                  className={`aspect-square rounded-lg ${
                    node.active && node.correct 
                      ? 'bg-green-900 border-2 border-green-500' 
                      : node.active 
                        ? 'bg-blue-900 border-2 border-blue-500'
                        : 'bg-gray-800 border border-gray-600 hover:border-blue-400'
                  } flex items-center justify-center cursor-pointer transition-all z-10`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      node.active && node.correct
                        ? 'bg-green-400'
                        : node.active
                          ? 'bg-blue-400'
                          : 'bg-gray-600'
                    }`}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-sm">
                Attempts: {attemptCount}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetSequence}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
      
      {/* Achievement popup */}
      {showAchievement && techGeniusAchievement && (
        <AchievementUnlock
          achievement={techGeniusAchievement}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </div>
  );
};

export default TechnicalPuzzle;