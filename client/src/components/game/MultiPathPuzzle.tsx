import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import usePuzzle from '@/lib/stores/usePuzzle';
import { useCharacter } from '@/lib/stores/useCharacter';
import { SkillType } from '@/lib/types';
import { PuzzleSolution } from '@/lib/data/puzzle-templates';
import { AlertCircle, Clock, HelpCircle, Lightbulb, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface MultiPathPuzzleProps {
  puzzleId: string;
  onComplete?: (success: boolean) => void;
  onClose?: () => void;
}

const MultiPathPuzzle: React.FC<MultiPathPuzzleProps> = ({ 
  puzzleId, 
  onComplete,
  onClose
}) => {
  const { 
    startPuzzle, 
    attemptSolution, 
    useHint, 
    getRemainingAttempts, 
    resetPuzzle, 
    abandonPuzzle,
    getPuzzleById,
    getActivePuzzle,
    puzzleOutcome,
    timeRemaining,
    updateTimer
  } = usePuzzle();
  
  const { character } = useCharacter();
  const [activeTab, setActiveTab] = useState<'info' | 'solutions' | 'outcome'>('info');
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const [usedHintIndices, setUsedHintIndices] = useState<number[]>([]);
  const [isSolutionAttempting, setIsSolutionAttempting] = useState(false);
  
  const puzzle = getActivePuzzle();
  
  // Start puzzle on component mount
  useEffect(() => {
    startPuzzle(puzzleId);
    setActiveTab('info');
    
    return () => {
      abandonPuzzle();
    };
  }, [puzzleId, startPuzzle, abandonPuzzle]);
  
  // Timer effect for timed puzzles
  useEffect(() => {
    if (timeRemaining === null) return;
    
    const timer = setInterval(() => {
      updateTimer();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, updateTimer]);
  
  // Change to outcome tab when puzzle is solved
  useEffect(() => {
    if (puzzleOutcome) {
      setActiveTab('outcome');
      
      // Call onComplete callback if provided
      if (onComplete) {
        // Add a delay to allow the outcome to be displayed
        const timeout = setTimeout(() => {
          onComplete(puzzleOutcome.success);
        }, 5000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [puzzleOutcome, onComplete]);
  
  const handleRequestHint = (index: number) => {
    if (!puzzle) return;
    
    if (usedHintIndices.includes(index)) {
      setSelectedHint(puzzle.hints[index]);
    } else {
      const hint = useHint(index);
      setSelectedHint(hint);
      setUsedHintIndices(prev => [...prev, index]);
    }
  };
  
  const handleAttemptSolution = async (solution: PuzzleSolution) => {
    if (isSolutionAttempting) return;
    
    setIsSolutionAttempting(true);
    
    try {
      await attemptSolution(solution.id);
    } finally {
      setIsSolutionAttempting(false);
    }
  };
  
  const handleResetPuzzle = () => {
    resetPuzzle();
    setActiveTab('info');
    setSelectedHint(null);
    setUsedHintIndices([]);
  };
  
  const handleAbandon = () => {
    abandonPuzzle();
    if (onClose) onClose();
  };
  
  // Check if character meets skill requirement
  const checkSkillRequirement = (requirement?: { type: SkillType, level: number }) => {
    if (!requirement) return true;
    
    const skill = character.skills.find(s => s.type === requirement.type);
    return !!skill && skill.level >= requirement.level;
  };
  
  // Get skill level for a skill type
  const getSkillLevel = (skillType: SkillType) => {
    const skill = character.skills.find(s => s.type === skillType);
    return skill ? skill.level : 0;
  };
  
  // Get display name for skill type
  const getSkillTypeName = (type: SkillType) => {
    switch (type) {
      case SkillType.Technical: return 'Technical';
      case SkillType.Scientific: return 'Scientific';
      case SkillType.Social: return 'Social';
      case SkillType.Navigation: return 'Navigation';
      case SkillType.Combat: return 'Combat';
      default: return 'Unknown';
    }
  };
  
  // Get color for skill type
  const getSkillTypeColor = (type: SkillType) => {
    switch (type) {
      case SkillType.Technical: return 'bg-blue-700';
      case SkillType.Scientific: return 'bg-green-700';
      case SkillType.Social: return 'bg-purple-700';
      case SkillType.Navigation: return 'bg-cyan-700';
      case SkillType.Combat: return 'bg-red-700';
      default: return 'bg-slate-700';
    }
  };
  
  if (!puzzle) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <Card className="w-full max-w-3xl bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Puzzle Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Puzzle data could not be loaded. Please try again.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAbandon}>Close</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-gray-900 text-white overflow-hidden">
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{puzzle.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    <Badge className={`mr-2 ${getSkillTypeColor(puzzle.type)}`}>
                      {puzzle.type}
                    </Badge>
                    Difficulty: {Array(puzzle.difficulty).fill('★').join('')}
                  </CardDescription>
                </div>
                {timeRemaining !== null && (
                  <div className="flex items-center bg-gray-800 p-2 rounded-md">
                    <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                    <span className="text-white font-mono">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mt-4 border-b border-gray-700">
                <button
                  className={`px-4 py-2 ${activeTab === 'info' 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('info')}
                >
                  Information
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'solutions' 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('solutions')}
                >
                  Solutions
                </button>
                {puzzleOutcome && (
                  <button
                    className={`px-4 py-2 ${activeTab === 'outcome' 
                      ? 'border-b-2 border-blue-500 text-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'}`}
                    onClick={() => setActiveTab('outcome')}
                  >
                    Outcome
                  </button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-6">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <p className="text-gray-300 italic border-l-4 border-blue-600 pl-4 py-2 bg-blue-900 bg-opacity-20">
                    {puzzle.introText}
                  </p>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Situation</h3>
                    <p className="text-gray-300">{puzzle.description}</p>
                  </div>
                  
                  {/* Hints Section */}
                  <div className="mt-6">
                    <div className="flex items-center mb-3">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                      <h3 className="text-lg font-semibold">Available Hints</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {puzzle.hints.map((_, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`justify-start ${usedHintIndices.includes(index) ? 'bg-yellow-900 bg-opacity-30' : ''}`}
                          onClick={() => handleRequestHint(index)}
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Hint #{index + 1}
                          {usedHintIndices.includes(index) && <span className="ml-2 text-xs">(Revealed)</span>}
                        </Button>
                      ))}
                    </div>
                    
                    {selectedHint && (
                      <div className="mt-3 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-md">
                        <p className="text-yellow-300">
                          <span className="font-bold">Hint:</span> {selectedHint}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="default" 
                      className="bg-blue-700 hover:bg-blue-600"
                      onClick={() => setActiveTab('solutions')}
                    >
                      View Possible Solutions
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Solutions Tab */}
              {activeTab === 'solutions' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                    <p className="text-sm text-yellow-300">
                      Attempts remaining: {getRemainingAttempts()} of 3
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Choose Your Approach</h3>
                    <p className="text-gray-300 mb-4">
                      Select a solution based on your skills and the situation. Different approaches have different chances of success and rewards.
                    </p>
                    
                    <div className="space-y-4">
                      {puzzle.solutions.map((solution) => {
                        const hasRequiredSkill = checkSkillRequirement(solution.requiredSkill);
                        const hasEnoughEnergy = character.energy >= solution.energyCost;
                        
                        return (
                          <Card key={solution.id} className={`border ${hasRequiredSkill ? 'border-gray-700' : 'border-red-900'} ${hasEnoughEnergy ? '' : 'border-yellow-900'} bg-gray-800`}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-lg">{solution.description}</h4>
                                  
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {solution.requiredSkill && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge 
                                              className={`${getSkillTypeColor(solution.requiredSkill.type)} ${!hasRequiredSkill ? 'opacity-50' : ''}`}
                                            >
                                              {getSkillTypeName(solution.requiredSkill.type)}: {solution.requiredSkill.level}
                                              {!hasRequiredSkill && ' (Not Met)'}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Your level: {getSkillLevel(solution.requiredSkill.type)}</p>
                                            <p>Required: {solution.requiredSkill.level}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    
                                    <Badge variant="outline" className="bg-gray-700 bg-opacity-50">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {solution.energyCost} Energy
                                    </Badge>
                                    
                                    <Badge variant="outline" className="bg-gray-700 bg-opacity-50">
                                      Success: {solution.successRate}%
                                    </Badge>
                                    
                                    <Badge variant="outline" className="bg-gray-700 bg-opacity-50">
                                      Reward: {solution.rewardModifier}x
                                    </Badge>
                                  </div>
                                </div>
                                
                                <Button
                                  disabled={!hasRequiredSkill || !hasEnoughEnergy || isSolutionAttempting}
                                  variant={hasRequiredSkill && hasEnoughEnergy ? "default" : "outline"}
                                  className={
                                    hasRequiredSkill && hasEnoughEnergy 
                                      ? "bg-blue-700 hover:bg-blue-600" 
                                      : "bg-gray-700 opacity-50"
                                  }
                                  onClick={() => handleAttemptSolution(solution)}
                                >
                                  Attempt
                                </Button>
                              </div>
                              
                              {!hasRequiredSkill && (
                                <p className="text-red-400 text-sm mt-2">
                                  Your {solution.requiredSkill ? getSkillTypeName(solution.requiredSkill.type) : ''} skill is not high enough for this approach.
                                </p>
                              )}
                              
                              {!hasEnoughEnergy && (
                                <p className="text-yellow-400 text-sm mt-2">
                                  You don't have enough energy for this approach. Current: {character.energy}/{character.maxEnergy}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('info')}
                    >
                      Back to Information
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Outcome Tab */}
              {activeTab === 'outcome' && puzzleOutcome && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-md ${puzzleOutcome.success ? 'bg-green-900 bg-opacity-30 border border-green-700' : 'bg-red-900 bg-opacity-30 border border-red-700'}`}>
                    <h3 className={`text-xl font-semibold ${puzzleOutcome.success ? 'text-green-400' : 'text-red-400'}`}>
                      {puzzleOutcome.success ? 'Success!' : 'Failure'}
                    </h3>
                    <p className="mt-2 text-gray-300">{puzzleOutcome.outcomeText}</p>
                  </div>
                  
                  {puzzleOutcome.success && puzzleOutcome.rewards && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Rewards</h3>
                      <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-md p-3">
                        <p className="text-white">
                          <span className="font-bold text-blue-300">Experience:</span> {puzzleOutcome.rewards.experience} XP
                        </p>
                        
                        {puzzleOutcome.rewards.items.length > 0 && (
                          <div className="mt-2">
                            <p className="font-bold text-blue-300">Items:</p>
                            <ul className="list-disc list-inside mt-1">
                              {puzzleOutcome.rewards.items.map((item) => (
                                <li key={item.id} className="text-white">{item.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={handleResetPuzzle}
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={handleAbandon}
                      className="bg-blue-700 hover:bg-blue-600"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <p className="text-xs text-gray-400">Health</p>
                  <div className="flex items-center">
                    <Progress value={(character.health / character.maxHealth) * 100} className="w-24 h-2 bg-gray-700" indicatorClassName="bg-red-500" />
                    <span className="ml-2 text-xs text-gray-400">{character.health}/{character.maxHealth}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Energy</p>
                  <div className="flex items-center">
                    <Progress value={(character.energy / character.maxEnergy) * 100} className="w-24 h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                    <span className="ml-2 text-xs text-gray-400">{character.energy}/{character.maxEnergy}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleAbandon}
              >
                Abandon Puzzle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiPathPuzzle;