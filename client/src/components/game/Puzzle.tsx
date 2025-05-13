import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { usePuzzle } from "@/lib/stores/usePuzzle";
import { useCharacter } from "@/lib/stores/useCharacter";
import { PuzzleType, SkillType } from "@/lib/types";
import Hint from "./Hint";

interface PuzzleProps {
  onPuzzleSolved: () => void;
}

const Puzzle = ({ onPuzzleSolved }: PuzzleProps) => {
  const { 
    activePuzzle, 
    userSolution, 
    updateSolution, 
    checkSolution, 
    getNextHint,
    endPuzzle 
  } = usePuzzle();
  
  const { selectedCharacter } = useCharacter();
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [solution, setSolution] = useState<any>(null);
  
  // Exit puzzle view if no active puzzle
  useEffect(() => {
    if (!activePuzzle) {
      onPuzzleSolved();
    } else {
      // Initialize solution state based on puzzle type
      initializeSolution();
    }
  }, [activePuzzle, onPuzzleSolved]);
  
  const initializeSolution = () => {
    if (!activePuzzle) return;
    
    // Create initial solution structure based on puzzle type
    let initialSolution: any;
    
    switch (activePuzzle.type) {
      case PuzzleType.Sequence:
        initialSolution = [];
        break;
      case PuzzleType.Rewiring:
        initialSolution = { connections: [] };
        break;
      case PuzzleType.Logic:
        if (activePuzzle.name === "Security Bypass") {
          initialSolution = { inputs: [false, false, false, false], expectedOutput: true };
        } else if (activePuzzle.name === "Diplomatic Negotiation") {
          initialSolution = { approaches: [] };
        }
        break;
      case PuzzleType.Pattern:
        initialSolution = { path: [] };
        break;
      case PuzzleType.Decryption:
        initialSolution = { key: "", message: "" };
        break;
      default:
        initialSolution = null;
    }
    
    setSolution(initialSolution);
    updateSolution(initialSolution);
  };
  
  const handleRequestHint = () => {
    const hint = getNextHint();
    if (hint) {
      setCurrentHint(hint);
    }
  };
  
  const handleSubmitSolution = () => {
    if (checkSolution()) {
      onPuzzleSolved();
    } else {
      // Show feedback for incorrect solution
      setCurrentHint("That's not quite right. Try a different approach.");
    }
  };
  
  const handleCancel = () => {
    endPuzzle(false);
    onPuzzleSolved();
  };
  
  const updateSolutionValue = (newValue: any) => {
    setSolution(newValue);
    updateSolution(newValue);
  };
  
  // Get relevant skill level for the current puzzle
  const getSkillLevel = (): number => {
    if (!activePuzzle || !activePuzzle.requiredSkill || !selectedCharacter) return 0;
    
    const skill = selectedCharacter.skills.find(
      s => s.type === activePuzzle.requiredSkill?.type
    );
    
    return skill ? skill.level : 0;
  };
  
  if (!activePuzzle || !selectedCharacter) {
    return null;
  }
  
  // Render different puzzle interfaces based on puzzle type
  const renderPuzzleInterface = () => {
    if (!activePuzzle || !solution) return null;
    
    switch (activePuzzle.type) {
      case PuzzleType.Sequence:
        return (
          <div className="space-y-4">
            <p className="text-gray-300">Enter the correct sequence of numbers:</p>
            <div className="flex flex-wrap gap-2">
              {[...Array(7)].map((_, index) => (
                <input
                  key={index}
                  type="number"
                  className="w-12 h-12 text-center bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={solution[index] || ''}
                  onChange={(e) => {
                    const newSolution = [...solution];
                    newSolution[index] = parseInt(e.target.value) || 0;
                    updateSolutionValue(newSolution);
                  }}
                />
              ))}
            </div>
          </div>
        );
        
      case PuzzleType.Logic:
        if (activePuzzle.name === "Security Bypass") {
          return (
            <div className="space-y-4">
              <p className="text-gray-300">Configure the logic gates to produce the expected output:</p>
              <div className="grid grid-cols-2 gap-4">
                {solution.inputs.map((value: boolean, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-300">Input {index + 1}</span>
                    <Button
                      variant={value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newInputs = [...solution.inputs];
                        newInputs[index] = !value;
                        updateSolutionValue({ ...solution, inputs: newInputs });
                      }}
                    >
                      {value ? "TRUE" : "FALSE"}
                    </Button>
                  </div>
                ))}
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">Required Output:</span>
                    <span className="text-green-400 font-bold">TRUE</span>
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (activePuzzle.name === "Diplomatic Negotiation") {
          const approaches = [
            "respectful", "aggressive", "patient", "direct", "formal", "casual"
          ];
          
          return (
            <div className="space-y-4">
              <p className="text-gray-300">Select the appropriate diplomatic approaches in the correct order:</p>
              <div className="grid grid-cols-2 gap-2">
                {approaches.map(approach => (
                  <Button
                    key={approach}
                    variant={solution.approaches.includes(approach) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      let newApproaches;
                      if (solution.approaches.includes(approach)) {
                        newApproaches = solution.approaches.filter((a: string) => a !== approach);
                      } else if (solution.approaches.length < 4) {
                        newApproaches = [...solution.approaches, approach];
                      } else {
                        return; // Already have max approaches
                      }
                      updateSolutionValue({ ...solution, approaches: newApproaches });
                    }}
                  >
                    {approach}
                  </Button>
                ))}
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <p className="text-sm text-gray-300">Selected approaches (in order):</p>
                <div className="flex gap-2 mt-1">
                  {solution.approaches.map((approach: string, idx: number) => (
                    <div key={idx} className="px-2 py-1 bg-blue-500 rounded text-sm">
                      {approach}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return null;
        
      case PuzzleType.Rewiring:
        // Simplified power distribution puzzle
        const sources = ["generator1", "generator2", "generator3", "backup"];
        const targets = ["lifesupport", "engines", "shields", "communications"];
        
        return (
          <div className="space-y-4">
            <p className="text-gray-300">Connect power sources to systems without overloading the circuits:</p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Power Sources</h3>
                {sources.map(source => (
                  <div key={source} className="p-2 bg-blue-900 rounded flex justify-between items-center">
                    <span>{source}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Select this source for connection
                        sessionStorage.setItem('selectedSource', source);
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Systems</h3>
                {targets.map(target => (
                  <div key={target} className="p-2 bg-gray-700 rounded flex justify-between items-center">
                    <span>{target}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Complete connection if a source is selected
                        const source = sessionStorage.getItem('selectedSource');
                        if (source) {
                          const newConnections = [...solution.connections];
                          
                          // Check if this target already has a connection
                          const existingConnectionIdx = newConnections.findIndex(
                            (c: any) => c.target === target
                          );
                          
                          if (existingConnectionIdx >= 0) {
                            // Replace existing connection
                            newConnections[existingConnectionIdx] = { source, target };
                          } else {
                            // Add new connection
                            newConnections.push({ source, target });
                          }
                          
                          updateSolutionValue({ ...solution, connections: newConnections });
                          sessionStorage.removeItem('selectedSource');
                        }
                      }}
                    >
                      Receive
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-gray-700 rounded">
              <h3 className="text-white font-semibold mb-2">Current Connections</h3>
              {solution.connections.length === 0 ? (
                <p className="text-sm text-gray-400">No connections yet</p>
              ) : (
                <div className="space-y-1">
                  {solution.connections.map((conn: {source: string, target: string}, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{conn.source}</span>
                      <span>→</span>
                      <span>{conn.target}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-6 px-2 text-red-400"
                        onClick={() => {
                          const newConnections = solution.connections.filter((_: any, i: number) => i !== idx);
                          updateSolutionValue({ ...solution, connections: newConnections });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4 bg-gray-700 rounded">
            <p className="text-gray-300 italic">This puzzle type is not fully implemented yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              For demonstration, you can click "Submit" to simulate solving the puzzle.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className="p-6 bg-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">{activePuzzle.name}</h2>
          <p className="text-gray-300 mb-4">{activePuzzle.description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Difficulty: {activePuzzle.difficulty}/5</span>
              {activePuzzle.requiredSkill && (
                <span className={`${
                  getSkillLevel() >= activePuzzle.requiredSkill.level
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  Required skill: {activePuzzle.requiredSkill.type} (Level {activePuzzle.requiredSkill.level})
                </span>
              )}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="my-6">
            {renderPuzzleInterface()}
          </div>
          
          {currentHint && (
            <Hint 
              text={currentHint} 
              onClose={() => setCurrentHint(null)} 
            />
          )}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="secondary" onClick={handleRequestHint}>
                Hint
              </Button>
              <Button variant="default" onClick={handleSubmitSolution}>
                Submit
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Puzzle;
