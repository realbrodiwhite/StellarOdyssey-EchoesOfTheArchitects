import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import puzzleTemplates from '@/lib/data/puzzle-templates';
import { PuzzleType } from '@/lib/types';
import MultiPathPuzzle from './MultiPathPuzzle';
import { 
  CircuitBoard, 
  Compass, 
  KeyRound, 
  FileDigit, 
  Puzzle, 
  Star, 
  Brain,
  Zap,
  Terminal 
} from 'lucide-react';

interface PuzzleSelectorProps {
  onClose: () => void;
}

const PuzzleSelector: React.FC<PuzzleSelectorProps> = ({ onClose }) => {
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  
  // Group puzzles by type
  const puzzlesByType = puzzleTemplates.reduce((acc, puzzle) => {
    if (!acc[puzzle.type]) {
      acc[puzzle.type] = [];
    }
    acc[puzzle.type].push(puzzle);
    return acc;
  }, {} as Record<PuzzleType, typeof puzzleTemplates>);
  
  // Icon for each puzzle type
  const getTypeIcon = (type: PuzzleType) => {
    switch (type) {
      case PuzzleType.Logic:
        return <Brain className="h-5 w-5 text-indigo-400" />;
      case PuzzleType.Pattern:
        return <Puzzle className="h-5 w-5 text-amber-400" />;
      case PuzzleType.Sequence:
        return <FileDigit className="h-5 w-5 text-emerald-400" />;
      case PuzzleType.Rewiring:
        return <CircuitBoard className="h-5 w-5 text-blue-400" />;
      case PuzzleType.Decryption:
        return <KeyRound className="h-5 w-5 text-purple-400" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Color for each puzzle type
  const getTypeColor = (type: PuzzleType) => {
    switch (type) {
      case PuzzleType.Logic:
        return 'bg-indigo-500 bg-opacity-20 border-indigo-600';
      case PuzzleType.Pattern:
        return 'bg-amber-500 bg-opacity-20 border-amber-600';
      case PuzzleType.Sequence:
        return 'bg-emerald-500 bg-opacity-20 border-emerald-600';
      case PuzzleType.Rewiring:
        return 'bg-blue-500 bg-opacity-20 border-blue-600';
      case PuzzleType.Decryption:
        return 'bg-purple-500 bg-opacity-20 border-purple-600';
      default:
        return 'bg-gray-700 bg-opacity-20 border-gray-600';
    }
  };
  
  // Handle puzzle selection
  const handleSelectPuzzle = (puzzleId: string) => {
    setSelectedPuzzleId(puzzleId);
  };
  
  // Handle puzzle completion
  const handlePuzzleComplete = () => {
    setSelectedPuzzleId(null);
  };
  
  if (selectedPuzzleId) {
    return (
      <MultiPathPuzzle 
        puzzleId={selectedPuzzleId}
        onComplete={handlePuzzleComplete}
        onClose={() => setSelectedPuzzleId(null)}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Multi-Path Puzzle System</h2>
            <p className="text-gray-400">Each puzzle can be solved in multiple ways based on your character's skills and your preferred approach.</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Close
          </Button>
        </div>
        
        <div className="space-y-8">
          {Object.entries(puzzlesByType).map(([type, puzzles]) => (
            <div key={type} className="space-y-4">
              <div className="flex items-center space-x-2">
                {getTypeIcon(type as PuzzleType)}
                <h3 className="text-xl font-semibold text-white">
                  {type} Puzzles
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {puzzles.map(puzzle => (
                  <motion.div
                    key={puzzle.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`border ${getTypeColor(puzzle.type)} hover:shadow-md hover:shadow-blue-900/20 cursor-pointer h-full`} 
                      onClick={() => handleSelectPuzzle(puzzle.id)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          {getTypeIcon(puzzle.type)}
                          <span>{puzzle.name}</span>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              Difficulty: {Array(puzzle.difficulty).fill('★').join('')}
                            </Badge>
                            {puzzle.timeLimit && (
                              <Badge variant="outline" className="bg-yellow-900 bg-opacity-30 text-yellow-400 border-yellow-700">
                                Timed
                              </Badge>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {puzzle.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-1 text-xs">
                          <Badge className="bg-gray-800 text-gray-300">
                            {puzzle.solutions.length} Solutions
                          </Badge>
                          {puzzle.solutions.some(s => s.requiredSkill?.type === 'Technical') && (
                            <Badge className="bg-blue-900 bg-opacity-40 text-blue-300">
                              <Terminal className="h-3 w-3 mr-1" />
                              Technical
                            </Badge>
                          )}
                          {puzzle.solutions.some(s => s.requiredSkill?.type === 'Scientific') && (
                            <Badge className="bg-green-900 bg-opacity-40 text-green-300">
                              <Brain className="h-3 w-3 mr-1" />
                              Scientific
                            </Badge>
                          )}
                          {puzzle.solutions.some(s => s.requiredSkill?.type === 'Navigation') && (
                            <Badge className="bg-cyan-900 bg-opacity-40 text-cyan-300">
                              <Compass className="h-3 w-3 mr-1" />
                              Navigation
                            </Badge>
                          )}
                          {puzzle.solutions.some(s => s.requiredSkill?.type === 'Combat') && (
                            <Badge className="bg-red-900 bg-opacity-40 text-red-300">
                              <Zap className="h-3 w-3 mr-1" />
                              Combat
                            </Badge>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PuzzleSelector;